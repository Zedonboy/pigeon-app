import { API_URL } from "../config";
import { IContext } from "./types";

export function applyProject(ctx : IContext, txnId : string) {
    return fetch(`${API_URL}/project/applyProject`, {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            txId: txnId,
            memberId: ctx.memberId
        })
    })
}

export function getProject() {
    return fetch(`${API_URL}/projects`)
}

export function createProject(ctx : IContext, txnId : string, project : {summary: string, name: string, assetId: string}, algostate : {max_dev:number, github_issue: string, lang: string}) {
    return fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            "Network":ctx.network
        },
        body: JSON.stringify({
            txId: txnId,
            max_dev: algostate.max_dev,
            lang: algostate.lang,
            github_issue: algostate.github_issue,
            project
        })
    })
}