import mockedPlayers from './players';
import mockedGames from './games';

/** @typedef {import('../types.ts').Player} Player */
/** @typedef {import('../types.ts').Participant} Participant */
/** @typedef {import('../types.ts').Participant} TourneyData */


/** @returns {Promise<{ tourneys: object; currentTourneyId: string; }>} */
export async function mockedFetchData() {
    let s = 0;

    /** @type {Participant[]} */
    const players = mockedPlayers.map((p, i) => ({
        name: p.name,
        sIndex: i % 2 ? s++ : s,
        pIndex: i % 2
    })).sort((a, b) => a.name.localeCompare(b.name))

    /** @type {TourneyData} */
    const mockedTourney = {
        id: '1234567890987654321',
        name: 'Fake tourney',
        templateCode: 'powersOf2',
        playersTotal: 32,
        withTop3: true,
        status: 'ongoing',
        players,
        games: mockedGames
    };

    // add couple of unassigned players
    players.unshift(
        { name: "Idler 1", sIndex: null, pIndex: 0 },
        { name: "Idler 2", sIndex: null, pIndex: 0 },
    )

    return {
        tourneys: {
            [mockedTourney.id]: mockedTourney,
            "id123": {
                id: "id123",
                name: "Unfetched tourney",
                status: "finished"
            }
        },
        currentTourneyId: mockedTourney.id
    };
}
