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
    kvMap: [string, string[]][]
    winner?: number
}

export interface Series {
    round: number
    index: number
    score: number[]
    players: (Participant | null)[]
    games: Game[]
    kvMap: [string, string[]][]
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