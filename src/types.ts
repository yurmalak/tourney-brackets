export interface Player {
    name: string
    media: {
        twitch?: string,
        yt?: string
    }
}

export interface Participant {
    name: string
    sIndex: number
    pIndex: number
}

export interface Game {
    id: string
    round: number
    index: number
    players: string[]
    winner?: number
    tourney?: string
    url?: string
}

export interface Series {
    round: number
    index: number
    score: number[]
    players: Participant[]
    games: Game[]
    winner?: number
}