import {WorldIDWidget} from "@worldcoin/id";
import { useRecoilValue } from "recoil";
import { AccountAtom } from "../../utils/atoms";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
export default function VerifyPage() {
  let account = useRecoilValue(AccountAtom)
  let navigator = useNavigate()
  if (!account){
    navigator(-1)
    return null
  }
  return (
    <section className="h-[70vh] w-full flex justify-center items-center">
        <div>
        <WorldIDWidget
        actionId="wid_staging_12270952572975e115dbe0dc388a4d13" // obtain this from developer.worldcoin.org
        signal={account}
        enableTelemetry
        onSuccess={(verificationResponse) => {
            fetch(`${API_URL}/member/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    signal: account,
                    ...verificationResponse
                })
            })
        }} // you'll actually want to pass the proof to the API or your smart contract
        onError={(error) => console.error(error)}
      />
        </div>
    
      ;
    </section>
  );
}
