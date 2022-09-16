import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import algosdk from "algosdk";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { AlgoClientContext, WalletConnectContext } from "../../App";
import { DAO_CREATOR_ADDRESS } from "../../config";
import { AccountAtom, ContextAtom, SecretAtom } from "../../utils/atoms";
import { createProject } from "../../utils/sdk";

let initial_state = {
  github_issue: "",
  max_dev: 0,
  name: "",
  summary: "",
  assetId: 0,
  lang: "P-DEV",
};
export default function Createproject() {
  const [formState, setFormState] = useState(initial_state);
  const client = useContext(AlgoClientContext)
  const account = useRecoilValue(AccountAtom)
  let navigator = useNavigate()
  // console.log(account)
  const connector = useContext(WalletConnectContext)
  const context = useRecoilValue(ContextAtom)
  const setSecret = useSetRecoilState(SecretAtom)
  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create Project for 100 algos
          </h3>
          <p className="mt-1 text-sm text-gray-500">Fill in details</p>
        </div>
        <form onSubmit={e => {
          e.preventDefault()
          let task = async () => {
            let params = await client!!.getTransactionParams().do()
            let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
              from: account!!,
              to: DAO_CREATOR_ADDRESS,
              amount: 1000000*2,
              suggestedParams: params
            })

            let txns = [txn];
            const txnsToSign = txns.map((txn) => {
              const encodedTxn = Buffer.from(
                algosdk.encodeUnsignedTransaction(txn)
              ).toString("base64");

              return {
                txn: encodedTxn,
                message: "Description of transaction being signed",
                // Note: if the transaction does not need to be signed (because it's part of an atomic group
                // that will be signed by another party), specify an empty singers array like so:
                // signers: [],
              };
            });

            const requestParams = [txnsToSign];
            const request = formatJsonRpcRequest(
              "algo_signTxn",
              requestParams
            );
            const result: Array<string | null> = await connector?.sendCustomRequest(request);
            const decodedResult = result.map((element : any) => {
              return new Uint8Array(Buffer.from(element, "base64"));
            });

            let {txId} = await client!!.sendRawTransaction(decodedResult).do()
            let resp = await createProject(context, txId, {
              summary: formState.summary,
              title: formState.name,
              assetId: formState.assetId.toString()
            }, {
              max_dev: formState.max_dev,
              github_issue: formState.github_issue,
              lang: formState.lang
            })

            if(resp.ok){
              let data = await resp.json()
              setSecret(data)
              toast.success("Succesfull")
              setTimeout(() => {
                navigator("/app/secret")
              }, 3000)
            } else {
              toast.error("Failed to connect to server.")
            }

          }

          task().then(r => {

          }).catch(err => {
            console.log(err)
          })
        }} className="mt-5 md:mt-0 md:col-span-2">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="first-name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                onChange={(e) => {
                  setFormState({ ...formState, name: e.target.value });
                }}
                id="first-name"
                autoComplete="given-name"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="asset-id"
                className="block text-sm font-medium text-gray-700"
              >
                Payment Asset Id
              </label>
              <input
                type="text"
                name="asset-id"
                id="asset-id"
                onChange={(e) => {
                  if (isNaN(parseInt(e.target.value))) return;
                  setFormState({
                    ...formState,
                    assetId: parseInt(e.target.value),
                  });
                }}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-4">
              <label
                htmlFor="max_dev"
                className="block text-sm font-medium text-gray-700"
              >
                Maximum number of developers
              </label>
              <input
                type="text"
                name="max_dev"
                id="max_dev"
                value={formState.max_dev}
                onChange={(e) => {
                  if (isNaN(parseInt(e.target.value))) return;
                  setFormState({
                    ...formState,
                    max_dev: parseInt(e.target.value),
                  });
                }}
                autoComplete="max_dev"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label
                htmlFor="lang"
                className="block text-sm font-medium text-gray-700"
              >
                Framework for the project
              </label>
              <select
                id="country"
                name="country"
                autoComplete="country-name"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option>JS</option>
                <option>PHP</option>
                <option>Ruby</option>
              </select>
            </div>

            <div className="col-span-6">
              <label
                htmlFor="github-issue"
                className="block text-sm font-medium text-gray-700"
              >
                Github Issue Number(create a issue in our repo, if you want)
              </label>
              <input
                type="text"
                name="github-issue"
                onChange={e => {
                  setFormState({...formState, github_issue: e.target.value})
                }}
                id="github-issue"
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="col-span-6">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700"
              >
                Summary
              </label>
              <div className="mt-1">
                <textarea
                  rows={4}
                  onChange={(e) => {
                    setFormState({ ...formState, summary: e.target.value });
                  }}
                  name="comment"
                  id="comment"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  defaultValue={""}
                />
              </div>
            </div>
           
          </div>
          <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create
            </button>
        </form>
      </div>
    </div>
  );
}
