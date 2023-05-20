/** @typedef {import('./types.ts').Participant} Participant */
/** @typedef {import('./types.ts').TourneyData} TourneyData */
/** @typedef {import('./types.ts').Series} Series */
/** @typedef {import('./types.ts').KvMap} KvMap */
/** @typedef {import('./types.ts').Game} Game */

import { writable } from 'svelte/store';


/** 
 * @param {string} a
 * @param {string} b
 */
export const playerSorter = (a, b) => a.localeCompare(b)

/** 
 * @param {Series} a
 * @param {Series} b
 */
export const gamesSorter = (a, b) => a.index - b.index


/** 
 * @param {KvMap} a
 * @param {KvMap} b
 */
export const kvMapSorter = (a, b) => {

    // put pairs with single value first
    const lessValues = a.length - b.length

    // then sort by keys
    return lessValues || a[0].localeCompare(b[0])
}


function Container() {
    this.games = []
    this.kvMap = []
}


/**
 * 
 */
export class Tourney {
    constructor({ games = [], kvMaps = [], ...data }) {

        this.tree = new Map()
        Object.assign(this, data)

        // group games by players and round
        for (const game of games) {
            const series = this.storeSessionData(game)
            series.games.push(game)
        }

        // same for maps
        for (const { round, players, kvMap } of kvMaps) {
            const series = this.storeSessionData({ round, players })
            series.kvMap.push(...kvMap)
        }

        // sort games
        for (const subMap of this.tree.values())
            for (const gamesByRound of subMap.values())
                for (const series of gamesByRound.values())
                    series.games.sort(gamesSorter)
    }

    /**
     * Creates array at the end of nested maps `tree => player1 => player2 => round`.
     * Players are sorted by names.
     * Keeps existing entities intact.
     * @param {{ players: string[], round: number }} gameLike
     * @returns {Game[]}
     */
    storeSessionData({ players, round }) {

        const [id1, id2] = [...players].sort(playerSorter)

        if (!this.tree.has(id1)) this.tree.set(id1, new Map())
        const subMap = this.tree.get(id1)

        if (!subMap.has(id2)) subMap.set(id2, new Map())
        const gamesByRound = subMap.get(id2)

        if (!gamesByRound.has(round)) gamesByRound.set(round, new Container())
        const series = gamesByRound.get(round)

        return series
    }

    /**
     * Fills `.players` array of each series with players
     * according to data stored in `players`.
     * @param {Series[]} firstRound 
     */
    assignPlayers(firstRound) {

        for (const player of this.players) {
            const { name, sIndex, pIndex } = player;

            // idle player
            if (sIndex === null) continue
            const series = firstRound[sIndex];
            const anotherPlayer = series.players[pIndex];

            if (anotherPlayer) {
                console.warn(`2 players aim for same slot (${name} and ${anotherPlayer.name}).`, this);
                player.sIndex = null
                player.pIndex = null
                continue;
            }

            series.players[pIndex] = player;
        }
    }

    /**
     * Returns all games this pair of players played in specified round.
     * @param {number} round 
     * @param {string[]} playerKeys 
     * @returns {{ games: Game[], data: string[][]}}
     */
    getSeries(round, playerKeys) {

        if (!playerKeys.every(Boolean)) return new Container()

        const keys = [...playerKeys].sort(playerSorter)
        keys.push(round)

        return keys.reduce((map, key) => map?.get(key), this.tree) || new Container()
    }

    save({ changed, selectedPlayers, series, seriesData }) {

        if (changed.players) {
            this.players = this.players.map(({ ...p }) => {
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

        const { games, kvMap } = seriesData
        if (changed.gamesOrMap) {

            // make path
            this.storeSessionData({
                players: selectedPlayers,
                round: series.round
            })
            const keys = selectedPlayers.sort(playerSorter)
            const roundMap = this.tree.get(keys[0]).get(keys[1])

            // update games
            const sortedGames = games
                .sort(gamesSorter)
                .map((game, index) => ({ ...game, index }))

            // sort kvMap by keys and drop empty ones
            const sortedMap = kvMap
                .filter(([key, v1, v2]) => key || v1 || v2)
                .sort(kvMapSorter)

            // and save
            const data = { kvMap: sortedMap, games: sortedGames }
            roundMap.set(series.round, data)
        }

        console.log("[log] Updating tourneyStore.", arguments)
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