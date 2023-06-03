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