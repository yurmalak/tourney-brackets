/** @typedef {import('../types').Game} Game */
/** @typedef {import('../types').KvMap} KvMap */

import { writable } from 'svelte/store';
import { Tourney } from '../lib/Tourney';


class WritableTourney extends Tourney {

    constructor({ dbClient, ...props }) {
        super(props)
        this.dbClient = dbClient
    }

    /** 
     * @param {{ 
     *  participants: string[],
     *  series: import("../lib/Series").default
     * }} args 
     */
    save({ participants, series }) {

        const dbUpdater = {}

        if (participants) {
            this.data.participants = participants
            dbUpdater.tourney = this.data
        }
        if (series) {
            this.storeSeries(series)
            dbUpdater.series = series.toDb()
        }

        // send data to db
        this.dbClient.updateData(dbUpdater)
            .then(({ result }) => {
                if (series && result.series) series.id = result.series
            })
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