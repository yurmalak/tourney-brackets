/** @typedef {import('../types.ts').TourneyData} TourneyData */
/** @typedef {import('../types.ts').Series} Series */
/** @typedef {import('../types.ts').KvMap} KvMap */
/** @typedef {import('../types.ts').Game} Game */


/** 
 * @param {string} a
 * @param {string} b
 */
export const playerSorter = (a, b) => a.localeCompare(b)

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
    /** @type {Game[]} */
    this.games = []
    /** @type {KvMap} */
    this.kvMap = []
    /** @type {string} */
    this.id = null
}


/**
 * 
 */
export class Tourney {

    /** @param {{ tourney: TourneyData, sList: Series[] }} */
    constructor({ tourney = {}, sList = [] }) {

        this.tree = new Map()
        this.data = tourney

        for (const series of sList) this.storeSeries(series)
    }

    /**
     * Players are sorted by names.
     * Keeps existing entities intact.
     * @param {Series} series
     */
    storeSeries(series) {

        const { players, round } = series
        const [p1, p2] = [...players].sort(playerSorter)

        if (!this.tree.has(round)) this.tree.set(round, new Map())
        const gamesByRound = this.tree.get(round)

        if (!gamesByRound.has(p1)) gamesByRound.set(p1, new Map())
        const firstPlayerGames = gamesByRound.get(p1)

        firstPlayerGames.set(p2, series)
    }

    /**
     * @param {number} round 
     * @param {string[]} playerKeys 
     */
    getSeries(round, playerKeys) {

        if (!playerKeys.every(Boolean)) return new Container()

        const keys = [...playerKeys].sort(playerSorter)
        keys.unshift(round)

        return keys.reduce((map, key) => map?.get(key), this.tree) || new Container()
    }
}
