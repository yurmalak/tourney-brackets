import { tourneyStore } from '../src/stores';

/** @typedef {import("../src/types").TourneyData} TourneyData */

/** @param {TourneyData} options */
export function setStore(options) {

    tourneyStore.set({
        withTop3: false,
        playersTotal: 8,
        players: [],
        games: [],
        ...options
    })
}