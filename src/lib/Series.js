import { calculateScore } from "./utils"

export default class Series {
    /**
     * @param {{
     *  tourney: import("./Tourney").Tourney,
     *  round: number,
     *  sIndex: number,
     *  ancestors: [Series,Series]|null,
     *  players: [string,string],
     *  isLoserSeries: boolean
     * }} args 
     */
    constructor({ tourney, round, sIndex, ancestors, players, isLoserSeries }) {

        this.tourney = tourney
        this.round = round
        this.sIndex = sIndex
        this.ancestors = ancestors
        this.players = players
        this.isLoserSeries = isLoserSeries

        // provided by Tourney.getSeriesData()
        this.id = null
        this.games = []
        this.kvMap = []

        // derived from games
        this.score = [0, 0]
        this.winner = undefined

        /** Number of descendants depends on tourney template - generally 1 or 2 */
        this.descendants = []

        /** Subscibe this series for future updates */
        for (const series of ancestors) series.registerDescendant(this)

        this.update()
    }

    /** @param {Series} series */
    registerDescendant(series) {
        this.descendants.push(series)
    }

    /** @param {[string,string]} players */
    update() {

        // seonds round and later - derive players from results of previous series
        this.ancestors.forEach((a, i) => {

            if (a.winner === null) return this.players[i] = ""

            // get winner index
            let playerIndex = a.winner

            // change to loser if it's loser series
            if (this.isLoserSeries) playerIndex = 1 - playerIndex

            this.players[i] = a.players[playerIndex]
        })

        // get games, kvMap and id from tourney data
        const seriesData = this.tourney.getSeriesData(this.round, this.players)
        Object.assign(this, seriesData)

        this.score = calculateScore(this.games, this.players)

        // not all games have been finished
        if (this.games.some(g => !g.winner)) return

        // check if enough games have been played
        const [a, b] = this.score
        const maxScore = Math.max(a, b);
        const seriesFinished = a !== b && maxScore >= this.tourney.winsRequired(this.round, this.sIndex)

        // write winner
        const oldWinner = this.winner ?? null
        this.winner = seriesFinished
            ? this.score.indexOf(maxScore)
            : null

        // update descendants
        const winnerChanged = this.winner !== oldWinner
        if (winnerChanged) for (const series of this.descendants) series.update()
    }

    toFront(processors = {}) {

        const { tourney } = this
        return {
            players: this.players.some(Boolean) ? this.players : "",
            winner: Number.isInteger(this.winner) ? this.winner : "",
            score: this.score,
            data: processors.series?.({ series: this, tourney }) ?? {},
            games: this.games.map(game => {

                const data = processors.game?.({ game, series: this, tourney }, this) ?? {}

                const g = { data }
                if (game.winner) g.winner = this.players.indexOf(game.winner)
                return g
            })
        }
    }

    toDb() {

        const { id, round, players, games, kvMap } = this
        return { id, round, players, games, kvMap, tourneyId: this.tourney.data.id }
    }
}