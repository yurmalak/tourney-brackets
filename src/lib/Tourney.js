/** @typedef {import('../types.ts').Participant} Participant */
/** @typedef {import('../types.ts').Series} Series */
/** @typedef {import('../types.ts').KvMap} KvMap */
/** @typedef {import('../types.ts').Game} Game */


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

    constructor({ tourney = {}, sList = [] }) {
        this.tree = new Map()
        Object.assign(this, tourney)
        for (const series of sList) this.storeSeriesData(series)
    }

    /**
     * Creates array at the end of nested maps `tree => player1 => player2 => round`.
     * Players are sorted by names.
     * Keeps existing entities intact.
     * @param {{ players: string[], round: number }} gameLike
     * @returns {Game[]}
     */
    storeSeriesData(series) {

        const { players, round } = series
        const [p1, p2] = [...players].sort(playerSorter)

        if (!this.tree.has(round)) this.tree.set(round, new Map())
        const gamesByRound = this.tree.get(round)

        if (!gamesByRound.has(p1)) gamesByRound.set(p1, new Map())
        const firstPlayerGames = gamesByRound.get(p1)

        firstPlayerGames.set(p2, series)
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
        keys.unshift(round)

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
            this.storeSeriesData({
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
