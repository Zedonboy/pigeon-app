export interface IProject {
    address : string,
    title : string,
    assetId : string
    amount: number
    unitName: string
    summary: string

}

export interface IContext {
    network : string
    memberId: number
}

export interface ICard {
    id: number
}