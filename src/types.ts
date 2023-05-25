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

/** Series with all data not relevant to front removed */
export interface FrontSeries {
    players?: [
        { name: string, url: string } | null,
        { name: string, url: string } | null
    ],
    games: []
    data: {}
    score: [number, number]
    nodeLeftTop?: [number, number]
}

export interface KvMap extends Array<[string, string] | [string, string, string]> {
}