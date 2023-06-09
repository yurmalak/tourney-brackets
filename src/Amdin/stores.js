/** @typedef {import('../types').Game} Game */
/** @typedef {import('../types').KvMap} KvMap */

import { writable } from 'svelte/store';
import { Tourney, playerSorter, kvMapSorter } from '../lib/Tourney';


class WritableTourney extends Tourney {

    constructor({ dbClient, ...props }) {
        super(props)
        this.dbClient = dbClient
    }

    /** 
     * @param {{ 
     *  changed: { players: boolean, series: boolean },
     *  selectedPlayers: [string, string],
     *  series: import("../types").Series
     *  seriesData: { games: Game[], kvMap: KvMap }
     * }} args 
     */
    save({ changed, selectedPlayers, series, seriesData }) {

        // to restore in case task fails
        this.backup = {}

        // object expected by Fauna
        const dbUpdater = {}

        // series' players and not it's position define which series it is
        if (changed.players) {

            // ensure it's not called to update anything other than first round
            if (series.round !== 0) {
                console.error("No manual players selecting allowed for rounds past 1st.")
                return this
            }

            // store to revert in case of db/conection errors
            this.backup.participants = [...this.data.participants]

            for (let i = 0; i < 2; i++) {

                // remove selected players from their old places
                const player = selectedPlayers[i]
                if (player !== "") {
                    const oldIndex = this.data.participants.indexOf(player)
                    this.data.participants[oldIndex] = ""
                }

                // replace players on selected positions
                const newIndex = series.index * 2 + i
                const oldOccupant = this.data.participants[newIndex]
                this.data.participants[newIndex] = player

                // append old occupant to the list
                if (oldOccupant !== "") this.data.participants.push(oldOccupant)
            }

            // sort idle players at the end of the list
            if (this.data.participants.length > this.data.playersTotal) {
                const idlers = this.data.participants
                    .splice(this.data.playersTotal)
                    .filter(Boolean)
                    .sort(playerSorter)
                this.data.participants.push(...idlers)
            }

            dbUpdater.tourney = this.data
        }

        let newSeries
        if (changed.series) {

            // store to revert in case of db/conection errors
            const oldData = this.getSeries(series.round, selectedPlayers)
            this.backup.series = {
                round: series.round,
                players: selectedPlayers,
                ...oldData,
            }

            // create new one
            // selectedPlayers will match series.players if Editor has been saved without changes to players
            // no id or id === null in seriesData will cause new series to be created
            // otherwise the one with matching id will be updated
            // see setupFauna.js
            newSeries = {
                tourneyId: this.data.id,
                round: series.round,
                players: selectedPlayers,
                ...seriesData,
            }

            // remove empty fields from maps and sort them
            const mapFilter = entry => entry.some((v, i) => (i > 0 && Boolean(v)))
            newSeries.kvMap = newSeries.kvMap.filter(mapFilter).sort(kvMapSorter)
            newSeries.games.forEach(g => g.kvMap = g.kvMap.filter(mapFilter).sort(kvMapSorter))

            this.storeSeries(newSeries)
            dbUpdater.series = newSeries
        }

        // send data to db
        this.dbClient.updateData(dbUpdater)
            .then(({ result }) => { if (result.series) newSeries.id = result.series })
            .catch(console.error)

        console.log("[log] Updating tourneyStore.", arguments)
        return this
    }
}

function createTourneyStore() {

    const { subscribe, set, update } = writable(new WritableTourney({}))

    return {
        set: (tourney) => set(new WritableTourney(tourney)),
        update: (...args) => update((tourney) => tourney.save(...args)),
        subscribe,
    }
}

export const tourneyList = writable();
export const tourneyStore = createTourneyStore()