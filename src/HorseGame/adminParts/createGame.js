/** @typedef {import("../../types").Game} Game */
import { createGame as defaultCreateGame } from "$lib/utils"


/**
 * Creates Game specific to Homm3 tourney "Игра в Коня"
 * @param {object} args passed to {@link defaultCreateGame createGame}.
 */
export default function createGame(args) {

    /** @type {Game} */
    const game = defaultCreateGame(args)
    game.data = {
        towns: [null, null],
        starters: [null, null],
        blue: null
    }

    return game
}