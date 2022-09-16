import { useState, createContext, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import DashboardHome from "./pages/Dashboard/Home";
import WalletConnect from "@walletconnect/client";
import { Algodv2 } from "algosdk";
import Login from "./pages/Login";
import { RecoilRoot, useSetRecoilState } from "recoil";
import { ToastContainer } from "react-toastify";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import {eventBus} from "./utils/eventbus"
import { AccountAtom, SecretAtom } from "./utils/atoms";
import 'react-toastify/dist/ReactToastify.css';
import Projects from "./pages/Dashboard/Projects";
import Cards from "./pages/Dashboard/IDCard";
import Createproject from "./pages/Dashboard/CreateProject";
import SecretTokenPage from "./pages/Dashboard/SecretToken";
import VerifyPage from "./pages/Dashboard/Verify";
const port = "";
const token = {
  "X-API-Key": "OGKyWzuveD7K0pEzegBu12PMwLe7SfV154aBTF8o",
};
const baseServer = "https://testnet-algorand.api.purestake.io/ps2";
export const WalletConnectContext = createContext<WalletConnect | null>(null);
export const AlgoClientContext = createContext<Algodv2 | null>(null);

function App() {
  const [algoClient, setAlgCLient] = useState<Algodv2 | null>(null)
  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnect | null>(null)
  const setAccountAddr = useSetRecoilState(AccountAtom)

  useEffect(()=> {
    const dclient = new Algodv2(token, baseServer, port);
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }
    
      // Get provided accounts
      const { accounts } = payload.params[0];
      setAccountAddr(accounts[0])
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }
    
      // Get updated accounts 
      const { accounts } = payload.params[0];
      setAccountAddr(accounts[0])
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      setAccountAddr(null)
    });

    eventBus.on("action.testnet", () => {
      const client = new Algodv2(token, baseServer, port);
      setAlgCLient(client)
    })
    eventBus.on("action.mainnet", () => {
      const client = new Algodv2(token, "https://mainnet-algorand.api.purestake.io/ps2", port);
      setAlgCLient(client)
    })
    setAlgCLient(dclient)
    setWalletConnectClient(connector)

  },[])
  return (
    <>
      <ToastContainer/>
    <AlgoClientContext.Provider value={algoClient}>
   
      <WalletConnectContext.Provider value={walletConnectClient}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/app" element={<DashboardHome />}>
              <Route index element={<Projects/>}/>
              <Route path="cards" element={<Cards/>}/>
              <Route path="create-project" element={<Createproject/>}/>
              <Route path="secret" element={<SecretTokenPage/>}/>
              <Route path="verify" element={<VerifyPage/>}/>
            </Route>
          </Routes>
        </HashRouter>
      </WalletConnectContext.Provider>
    </AlgoClientContext.Provider>
    </>
  );
}

export default App;
