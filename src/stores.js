import { writable } from 'svelte/store';

export const tourneyList = writable();
export const tourneyStore = writable({
    templateCode: "none",
    playersTotal: 32,
    withTop3: false,
    players: [],
    games: []
});