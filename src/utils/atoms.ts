import { atom } from "recoil";
import { IContext } from "./types";


export const AccountAtom = atom<string | null>({key:"account-address", default: null})
export const ContextAtom = atom<IContext>({key: "app-context", default: {network: "test", memberId: -1, verified: false}})
export const SecretAtom = atom<{passcode : string, project: any} | null>({
    key:"secret",
    default: null
})