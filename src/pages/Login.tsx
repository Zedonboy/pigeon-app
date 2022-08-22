
import { LockClosedIcon } from "@heroicons/react/solid";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import WalletConnect from "@walletconnect/client";
import algosdk, { OnApplicationComplete, waitForConfirmation } from "algosdk";
import { ApplicationLocalState } from "algosdk/dist/types/src/client/v2/algod/models/types";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import { buffer } from "stream/consumers";
import { AlgoClientContext, WalletConnectContext } from "../App";
import { DAO_DAPP_ID, PARTICIPATION_ASSET_ID } from "../config";
import { AccountAtom, ContextAtom } from "../utils/atoms";


async function sign(txn : algosdk.Transaction, connector : WalletConnect) {
  const txns = [txn]
const txnsToSign = txns.map(txn => {
  const encodedTxn = Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString("base64");

  return {
    txn: encodedTxn,
    message: 'Description of transaction being signed',
    // Note: if the transaction does not need to be signed (because it's part of an atomic group
    // that will be signed by another party), specify an empty singers array like so:
    // signers: [],
  };
});

const requestParams = [txnsToSign];

const request = formatJsonRpcRequest("algo_signTxn", requestParams);
const result: Array<string | null> = await connector.sendCustomRequest(request);
const decodedResult = result.map(element => {
  return element ? new Uint8Array(Buffer.from(element, "base64")) : null;
});

return decodedResult
}
export default function Login() {
  let connector = useContext(WalletConnectContext);
  let [account, setAccount] = useRecoilState(AccountAtom);
  let [context, setContext] = useRecoilState(ContextAtom);
  let navigator = useNavigate();
  let client = useContext(AlgoClientContext);
  let [devId, setDevID] = useState("");
  useEffect(() => {
    if (context.memberId !== -1) return;
    let task = async () => {
      let info = await client?.accountInformation(account as string).do();
      console.log(info)
      if (!info) return;
      let appState: ApplicationLocalState | undefined = info[
        "apps-local-state"
      ]?.find((v: ApplicationLocalState) => v.id === DAO_DAPP_ID);
      //@ts-ignore
      let TKV = appState?.["key-value"]?.find((k) => atob(k.key) === "member");
      if (TKV) {
        setContext({ ...context, memberId: TKV.value.uint as number });
        // move to next screen
        navigator("/app");
      } else {
        setContext({ ...context, memberId: 0 });
      }
    };

    task();
  }, [account, context]);
  
  if (context.memberId === -1) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <img
                className="mx-auto h-12 w-auto"
                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                alt="Workflow"
              />
              <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
                Connect to your account
              </h2>
            </div>
            <div className="mt-8 space-y-6">
              {/* <input type="hidden" name="remember" defaultValue="true" /> */}
              {/* <div className="rounded-md shadow-sm -space-y-px"></div> */}

              <div>
                <button
                  disabled={account != null}
                  onClick={(e) => {
                    if(connector?.connected){
                      setAccount(connector.accounts[0])
                    } else {
                      connector?.createSession();
                    }
                    // connector?.killSession()
                   
                  }}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:bg-gray-500 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  } else if (context.memberId === 0)
    
  return (
      <>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <img
                className="mx-auto h-12 w-auto"
                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
                alt="Workflow"
              />
              <h2 className="mt-6 text-center text-3xl tracking-tight font-bold text-gray-900">
                Connect to your account
              </h2>
            </div>
            <div className="mt-8 space-y-6">
             
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Developer ID
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="text"
                    autoComplete="dev-id"
                    onChange={(e) => {
                      setDevID(e.target.value);
                    }}
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Developer ID"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={(e) => {
                    let task = async () => {
                      let encoder = new TextEncoder();
                      if (isNaN(parseInt(devId))) {
                        console.log("DevId is not a number");
                        throw new Error("DevId is n ot a number")
                      }

                      const idNumber = parseInt(devId)
                      let params = await client?.getTransactionParams().do();
                      if (!params) {
                        console.error("Suggested Param is emnpty");
                        throw new Error("Suggested Params is null")
                      }
                      let assetOptin = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                        from: account as string,
                        to: account as string,
                        amount: 0,
                        assetIndex: PARTICIPATION_ASSET_ID,
                        suggestedParams: params
                      })

                      let optInTxn = algosdk.makeApplicationOptInTxnFromObject({
                        from: account as string,
                        appIndex: DAO_DAPP_ID,
                        foreignAssets: [parseInt(devId)],
                        suggestedParams: params,
                      });

                      let registerCall =
                        algosdk.makeApplicationCallTxnFromObject({
                          from: account as string,
                          suggestedParams: params,
                          foreignAssets: [parseInt(devId),105293033],
                          appIndex: DAO_DAPP_ID,
                          appArgs: [encoder.encode("register_member")],
                          onComplete: OnApplicationComplete.NoOpOC,
                        });

                      let desc = [
                        "Opt In for our participation token",
                        "Do want opt-in for the application?",
                        "Do you want to become a member?",
                      ];
                      let txns = [assetOptin,optInTxn,registerCall];
                      let txnGroupId = algosdk.assignGroupID(txns);
                      let txnsToSign = txns.map((txn, i) => {
                        const encodedTxn = Buffer.from(
                          algosdk.encodeUnsignedTransaction(txn)
                        ).toString("base64");

                        return {
                          txn: encodedTxn,
                          message: desc[i],
                        };
                      });


                      const requestParams = [txnsToSign];
                      const request = formatJsonRpcRequest(
                        "algo_signTxn",
                        requestParams
                      );
                      const result: Array<string | null> =
                        await connector?.sendCustomRequest(request);
                      const decodedResult = result.map((element) => {
                        return element
                          ? new Uint8Array(Buffer.from(element, "base64"))
                          : null;
                      });

                      let {txId} = await client!!.sendRawTransaction(decodedResult as Uint8Array[]).do()

                      setContext({...context, memberId: idNumber})
                      console.log(txId)
                      // await algosdk.waitForConfirmation(client!!, txId, 4)
                    };

                    task().then(r => {
                        navigator("/app")
                    }).catch(err => {
                      console.error(err)
                        toast.error(err.message || "Error in Processing")
                    });
                  }}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  Become a member
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );

    navigator("/app");
    return null
}
