import { tourneyStore } from '../src/stores';

/** @typedef {import("../src/types").TourneyData} TourneyData */

/** @param {TourneyData} options */
export function setStore({ tourney = {}, sList = [], ...other } = {}) {

    tourneyStore.set({
        tourney: {

            withTop3: false,
            playersTotal: 8,
            participants: [],
            templateCode: "powersOf2",
            ...tourney
        },
        sList: [
            ...sList
        ],
        ...other
    })
}