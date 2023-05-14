/** @typedef {import('../../types').Participant} Participant */
/** @typedef {import('../../types').Series} Series */

/**
 * @param {Series} series
 * @param {[string?, string?]} selectedPlayers
 * @param {Participant[]} players
 */
export default function buildPlayerList(series, selectedPlayers, players) {

    const adjustments = selectedPlayers.map((p) => !p);

    // temporarily mark players as idle (not playing any series)
    // until either saved or discarded
    const playerList = players.map((p) => {
        const currentIndex = selectedPlayers.indexOf(p.name);
        if (currentIndex === -1 && p.sIndex === series.index) {
            adjustments[currentIndex] = true;
            return { ...p, sIndex: null };
        }
        return { ...p };
    });

    // temporarily mark newly selected players as if they play this series
    adjustments.forEach((done, i) => {
        if (done) return;

        const name = selectedPlayers[i];
        if (!name) return;

        const playerIndex = players.findIndex((p) => p.name === name);
        playerList[playerIndex] = { ...playerList[playerIndex], sIndex: series.index };
    });

    // put idle players at the start of the list
    playerList.sort((a, b) =>
        a.sIndex === null && b.sIndex === null
            ? 0
            : a.sIndex === null
                ? -1
                : b.sIndex === null
                    ? 1
                    : a.name.localeCompare(b.name)
    );


    return playerList
}