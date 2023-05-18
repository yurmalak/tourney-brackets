/** @typedef {import('../types.ts').Game} Game */
/** @typedef {import('../types.ts').KvMap} KvMap */

import playerList from "./players"
import { createGame } from "../lib/utils"


const lorem = `Throughput drive awareness to increase engagement increase the resolution, scale it up we need a larger print. Exposing new ways to evolve our design language. We need to leverage our synergies we’ve got to manage that low hanging fruit. Sacred cow cross functional teams enable out of the box brainstorming but synergize productive mindfulness globalize pulling teeth. Roll back strategy circle back that ipo will be a game-changer. What are the expectations a better understanding of usage can aid in prioritizing future efforts so manage expectations for the right info at the right time to the right people, and guerrilla marketing.`
const words = lorem.split(" ")
const { length } = words
const slice = (size) => {
    const start = Math.round((length - 20) * Math.random())
    return words.slice(start, start + size).join(" ")
}

function makeMockedData(items) {

    const data = []
    if (items === undefined) items = Math.round(Math.random() * 3)

    for (let i = 0; i < items; i++) {

        const pair = []
        data.push(pair)

        pair[0] = slice(1)                              // key
        if (Math.random() < 0.5) pair[1] = [slice(8)]  // single value
        else pair[1] = [slice(4), slice(4)]           // pair
    }

    return data
}


/** @type {Array<Game>} */
export const games = []

/** @type {KvMap} */
export const kvMaps = []


for (let i = 0; i < playerList.length; i += 2) {

    const game = createGame({
        round: 0,
        index: 0,
        players: playerList.slice(i, i + 2).map(p => p.name)
    })

    // create data for the game
    game.kvMap = makeMockedData()
    game.winner = Math.round(Math.random())
    games.push(game)

    // create add data for some series in round 1
    if (Math.random() < 0.5) {
        kvMaps.push({
            round: 0,
            sIndex: i / 2,
            players: game.players,
            kvMap: makeMockedData()
        })
    }

    // and for some in round 2
    if (i % 4) {
        kvMaps.push({
            round: 1,
            sIndex: (i - 2) / 4,
            players: [
                games[i / 2 - 1].players[game.winner],
                game.players[game.winner]
            ],
            kvMap: makeMockedData()
        })
    }
}