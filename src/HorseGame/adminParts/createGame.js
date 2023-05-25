/** @typedef {import("../../types").Game} Game */
import { createGame as defaultCreateGame } from "$lib/utils"


/**
 * Creates Game specific to Homm3
 * @param {Series}
 */
export default function createGame(series) {

    /** @type {Game} */
    const game = defaultCreateGame(series)

    let i = 0
    game.data = {}
    for (const key of series.players) {
        game.data[key] = { town: "", starter: "", color: i++ ? "blue" : "red" }
    }

    return game
}