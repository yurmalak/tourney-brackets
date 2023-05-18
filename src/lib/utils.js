/** @typedef {import("../types").Game} Game */


/** 
 * @param {number} n
 * @returns {string} n-length string of numbers 
 */
export function uniqueNumber(n = 20) {
    const firstPart = Math.random().toString().slice(2) + Date.now()
    const secondPart = Math.random().toString().slice(2).slice(0, n - firstPart.length)
    return firstPart + secondPart
}

/**
 * @param {{ round: number, index: number, players: string[]}}
 * @return {Game}
 */
export function createGame({ round, index, players }) {
    return {
        id: uniqueNumber(),
        round,
        index,
        players,
        kvMap: [],
        data: {}
    }
}

/**
 * @param {number} round
 * @param {number} index
 * @returns {Series}
 */
export function createSeries(round, index) {

    /** @type {Series} */
    return {
        round,
        index,
        score: [0, 0],
        players: [null, null],
        games: [],
        kvMap: []
    };
}

/**
 * @param {Game[]} games 
 */
export function calculateScore(games) {

    return games.reduce(
        (score, game) => {
            if (game.winner === undefined) return score;
            score[game.winner]++;
            return score;
        },
        [0, 0]
    )
}