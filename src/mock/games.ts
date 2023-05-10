import type { Game } from "../types"
import playerList from "./players"


const games: Array<Game> = []

const createGame = (
    round: number,
    index: number,
    players: string[],
) => ({
    id: Math.random().toString().slice(2),
    round,
    index,
    players,
    winner: Math.round(Math.random()),
})

for (let i = 0; i < playerList.length; i += 2) {
    games.push(
        createGame(
            0,
            i / 2,
            playerList.slice(i, i + 2).map(p => p.name)
        )
    )
}

export default games