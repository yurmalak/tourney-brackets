
import type { Series, Game, Participant } from '../types';


export function createSeries(round: number, index: number): {
    round: number,
    index: number,
    score: number[],
    players: Participant[],
    games: Game[]
} {
    return {
        round,
        index,
        score: [0, 0],
        /** @type {Participant[]} */
        players: [],
        /** @type {Game[]} */
        games: []
    };
}

export function populateSeries(
    series: Series,
    gamesByRound: Array<Array<Game>>,
    seriesByRound: Array<Array<Series>>,
    roundsTotal: number,
    bestOf: (round: number) => number
) {
    // skip understaffed series
    if (!series.players[0] || !series.players[1]) {
        series.games = [];
        return;
    }

    for (const game of gamesByRound[series.round]) {
        // skip games with different players
        const samePlayers = series.players.every((p) => game.players.includes(p.name));
        if (!samePlayers) continue;

        series.games.push(game);
        if (game.winner !== undefined) {
            // players can be in different order
            const winnerName = game.players[game.winner];
            const winnerIndex = series.players.findIndex((p) => p.name === winnerName);
            series.score[winnerIndex]++;
        }
    }

    // check if series finished
    const [a, b] = series.score;
    const maxScore = Math.max(...series.score);
    const finished = a !== b && maxScore >= bestOf(series.round);
    if (!finished) return;

    series.winner = series.score.indexOf(maxScore);

    // winner goes to next round
    if (series.round >= roundsTotal - 1) return;
    const winner = series.players[series.winner];
    const nextRound = seriesByRound[series.round + 1];
    const nextSIndex = Math.floor(series.index / 2);
    const nextSeries = nextRound[nextSIndex];
    const nextPIndex = series.index % 2;
    nextSeries.players[nextPIndex] = winner;

    populateSeries(nextSeries, gamesByRound, seriesByRound, roundsTotal, bestOf);
}


export function bundleSeries(args: {
    roundsTotal: number,
    playersTotal: number,
    tourneyPlayers: Array<Participant>,
    tourneyGames: Array<Game>
}) {

    const { roundsTotal, playersTotal, tourneyPlayers, tourneyGames } = args

    const gamesByRound: Array<Array<Game>> = Array(roundsTotal)
        .fill(1)
        .map(() => []);

    const seriesByRound: Array<Array<Series>> = Array(roundsTotal)
        .fill(1)
        .map(() => []);

    const idlePlayers = new Map(tourneyPlayers.map((p) => [p.name, p]));
    const finals = seriesByRound[roundsTotal - 1];

    let seriesInRound = playersTotal;
    for (let round = 0; round < roundsTotal; round++) {
        // each series takes 2 players
        seriesInRound /= 2;
        // create empty series
        for (let index = 0; index < seriesInRound; index++) {
            seriesByRound[round].push(createSeries(round, index));
        }
    }

    // assign players to first round
    const firstRound = seriesByRound[0];
    for (const player of idlePlayers.values()) {
        const { name, sIndex, pIndex } = player;
        const series = firstRound[sIndex];
        if (!series) continue;

        const anotherOne = series.players[pIndex];
        if (anotherOne) {
            console.warn(`2 players aim for same slot (${name} and ${anotherOne.name}).`);
            continue;
        }

        series.players[pIndex] = player;
        idlePlayers.delete(name);
    }

    for (const game of tourneyGames) gamesByRound[game.round].push(game);

    return { gamesByRound, seriesByRound, finals, idlePlayers }
}