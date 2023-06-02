/** @typedef {import("../../types").Game} Game */
/** @typedef {import("../../types").Series} Series */


/**
 * Creates Game specific to Homm3
 * @param {Game}
 * @param {Series}
 */
export default function adjustNewGame(game, series) {

    let i = 0
    game.data = {}
    for (const key of series.players) {
        game.data[key] = { town: "", starter: "", color: i++ ? "blue" : "red" }
    }

    return game
}