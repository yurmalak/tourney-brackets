/** @typedef {import('./types.ts').Participant} Participant */
/** @typedef {import('./types.ts').TourneyData} TourneyData */
/** @typedef {import('./types.ts').Series} Series */
/** @typedef {import('./types.ts').Game} Game */

import { writable } from 'svelte/store';


/** 
 * @param {string} a
 * @param {string} b
 */
const playerSorter = (a, b) => a.localeCompare(b)

/** 
 * @param {Series} a
 * @param {Series} b
 */
const seriesSorter = (a, b) => a.index - b.index

class Tourney {
    constructor({ games = [], ...data }) {

        this.gameMap = new Map()
        Object.assign(this, data)

        // group games by players and round
        for (const game of games) {
            const arr = this.createSessionArray(game)
            arr.push(game)
        }

        for (const subMap of this.gameMap.values())
            for (const gamesByRound of subMap.values())
                for (const arr of gamesByRound.values())
                    arr.sort(seriesSorter)
    }

    /**
     * Creates array at the end of nested maps `gameMap => player1 => player2 => round`.
     * Keeps existing values intact.
     * @param {{ players: string[], round: number }} gameLike
     * @returns {Game[]}
     */
    createSessionArray({ players, round }) {

        const [id1, id2] = [...players].sort(playerSorter)

        if (!this.gameMap.has(id1)) this.gameMap.set(id1, new Map())
        const subMap = this.gameMap.get(id1)

        if (!subMap.has(id2)) subMap.set(id2, new Map())
        const gamesByRound = subMap.get(id2)

        if (!gamesByRound.has(round)) gamesByRound.set(round, [])
        const arr = gamesByRound.get(round)

        return arr
    }

    /**
     * Returns all games this pair of players played in specified round.
     * @param {number} round 
     * @param {string[]} playerKeys 
     * @returns {Game[]}
     */
    getGames(round, playerKeys) {

        const keys = [...playerKeys].sort(playerSorter)
        keys.push(round)

        return keys.reduce((map, key) => map?.get(key), this.gameMap) || []
    }

    save({ changed, selectedPlayers, series, seriesGames }) {


        if (changed.players) {
            this.players = this.players = this.players.map(({ ...p }) => {
                if (selectedPlayers.includes(p.name)) {
                    p.sIndex = series.index;
                    p.pIndex = selectedPlayers.indexOf(p.name);
                } else if (p.sIndex === series.index) {
                    p.sIndex = null;
                    p.pIndex = null;
                }

                return p;
            });
        }


        if (changed.games) {

            // make path
            this.createSessionArray({
                players: selectedPlayers,
                round: series.round
            })
            const keys = selectedPlayers.sort(playerSorter)
            const roundMap = this.gameMap.get(keys[0]).get(keys[1])

            // update
            const sortedGames = seriesGames.length === 0
                ? []
                : [...seriesGames]
                    .sort((a, b) => a.index - b.index)
                    .map((game, index) => ({ ...game, index }))

            roundMap.set(series.round, sortedGames)
        }


        console.log("Updating tourneyStore.", arguments)
        return this
    }
}


function createTourneyStore() {

    // creating this dummy is the only way I found
    // to add suggestions to $tourneyStore object
    const { subscribe, set, update } = writable(new Tourney({}))

    return {
        /** @param {TourneyData} tourney */
        set: (tourney) => set(new Tourney(tourney)),
        update: (args) => update((tourney) => tourney.save(args)),
        subscribe,
    }
}

export const tourneyList = writable();
export const tourneyStore = createTourneyStore()