export interface Game {
    id: string
    kvMap: KvMap
    data: {}
    winner?: string
}

export interface Series {
    round: number
    index: number
    score: number[]
    players: string[]
    games: Game[]
    kvMap: KvMap
    winner?: string
}

export interface TourneyData {
    id: string
    name: string
    templateCode: string
    withTop3: boolean
    players: string[]
    games: Game[]
    playersTotal: number
}

export interface KvMap extends Array<[string, string] | [string, string, string]> {
}