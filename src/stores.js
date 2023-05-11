/** @typedef {import('./types.ts').Participant} Participant */
/** @typedef {import('./types.ts').Tournament} Tournament */
/** @typedef {import('./types.ts').Series} Series */
/** @typedef {import('./types.ts').Game} Game */

import { writable } from 'svelte/store';



function createTourneyStore() {

    // create this dummy object is the only way I found
    // to add suggestions to $tourneyStore object
    const { subscribe, set, update } = writable({
        /**
         * @param {number} round
         * @param {string[]} playerKeys
         * @returns {Game[]}
         */
        // eslint-disable-next-line no-unused-vars
        getGames: (round, playerKeys) => []
    });

    return {
        /** @param {Tournament} tourney */
        set: (tourney) => {
            /** 
             * @param {string} a
             * @param {string} b
             */
            const playerSorter = (a, b) => a.localeCompare(b)


            const gameMap = new Map()

            // group games by `player1 => player2 => round`
            for (const game of tourney.games) {

                const [id1, id2] = [...game.players].sort(playerSorter)

                if (!gameMap.has(id1)) gameMap.set(id1, new Map())
                const subMap = gameMap.get(id1)

                if (!subMap.has(id2)) subMap.set(id2, new Map())
                const gamesByRound = subMap.get(id2)

                if (!gamesByRound.has(game.round)) gamesByRound.set(game.round, [])
                const arr = gamesByRound.get(game.round)

                arr.push(game)
            }

            for (const subMap of gameMap.values())
                for (const gamesByRound of subMap.values())
                    for (const arr of gamesByRound.values())
                        arr.sort((a, b) => a.index - b.index)

            /**
             * @param {number} round 
             * @param {string[]} playerKeys 
             * @returns 
             */
            function getGames(round, playerKeys) {

                const keys = [...playerKeys].sort(playerSorter)
                keys.push(round)

                return keys.reduce((map, key) => map?.get(key), gameMap) || []
            }

            return set({ ...tourney, getGames })
        },
        subscribe,
        update,
    }
}

export const tourneyList = writable();
export const tourneyStore = createTourneyStore()