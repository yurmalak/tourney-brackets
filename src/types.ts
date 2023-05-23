export interface Player {
    name: string
    media: {
        twitch?: string,
        yt?: string
    }
}

export interface Participant {
    name: string
    sIndex: number | null
    pIndex: number | null
}

export interface Game {
    id: string
    round: number
    index: number
    players: string[]
    kvMap: KvMap
    data: {}
    winner?: number
}

export interface Series {
    round: number
    index: number
    score: number[]
    players: (Participant | null)[]
    games: Game[]
    kvMap: KvMap
    winner?: number
}

export interface TourneyData {
    id: string
    name: string
    templateCode: string
    withTop3: boolean
    players: Participant[]
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