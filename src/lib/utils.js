/** @typedef {import("../types").Game} Game */


/** @returns {string} 32-length string of numbers */
export function uniqueNumber() {
    const firstPart = Math.random().toString().slice(2) + Date.now()
    const secondPart = Math.random().toString().slice(2).slice(0, 32 - firstPart.length)
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
        data: []
    }
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
        data: []
    };
}