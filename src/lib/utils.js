/** @typedef {import("../types").Game} Game */
/** @typedef {import("../types").Series} Series */

/** 
 * @returns {string} 16-length string of numbers 
 */
function uniqueNumber() {
    return Math.random().toString().slice(2, 5) + Date.now()
}

/** @returns {Game} */
export function createGame() {
    return {
        id: uniqueNumber(),
        kvMap: [],
        data: {},
        winner: ""
    }
}

/**
 * @param {Game[]} games 
 * @param {[string, string]} players
 */
export function calculateScore(games, players) {

    return games.reduce(
        (score, game) => {
            if (game.winner === undefined) return score;

            const winnerIndex = players.indexOf(game.winner)
            score[winnerIndex]++;
            return score;
        },
        [0, 0]
    )
}

/**
 * Checks if urls leads to correct `sites`
 * @param {string} value 
 * @param {string[]} sites 
 */
export function validateUrl(value, sites = []) {
    const allowedString = sites.map((a) => a.replace(/\.|\\|\//g, '\\$&')).join('|');
    const pat = new RegExp(`^(https:\\/\\/)?(www\\.)?(${allowedString})[\\S]+$`);
    return !value || pat.test(value);
}


export const tabbableSelector = ['a', 'button', 'input', 'select', '[contenteditable]']
    .reduce((selector, tag) => selector + tag + ':not(:disabled, [tabindex="-1"]),', '')
    .slice(0, -1);