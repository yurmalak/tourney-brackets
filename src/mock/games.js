/** @typedef {import('../types.ts').Game} Game */

import playerList from "./players"
import { createGame } from "../lib/utils"


/** @type {Array<Game>} */
const games = []


for (let i = 0; i < playerList.length; i += 2) {

    const game = createGame({
        round: 0,
        index: i / 2,
        players: playerList.slice(i, i + 2).map(p => p.name)
    })

    game.winner = Math.round(Math.random())
    games.push(game)

}

export default games