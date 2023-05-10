import playerList from "./players"

/** @typedef {import('../types.ts').Game} Game */

/** @type {Array<Game>} */
const games = []

/**
 * 
 * @param {number} round 
 * @param {number} index 
 * @param {string[]} players 
 */
const createGame = (round, index, players) => ({
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