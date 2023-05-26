

function series(series) {

    const data = { hide: {} }

    for (const [key, v1, /*v2*/] of series.kvMap) {
        switch (key) {
            // render clock icon to tell that game date has been defined
            case "начало":
                if (!series.games.length) data.start = v1
                break

            // hide nodes that currently overlap with static text on the image
            case "hide":

                // hide both if only the key has been provided
                if (!v1) {
                    data.hide = true
                }
                else {
                    data.hide = v1
                }
                break
        }
    }

    return data
}

function game(game, series, tourney) {

    const gameData = { roulette: [] }

    // add condition common fo all games in round
    const rule = tourney.data.commonRules?.[series.round] || []
    if (rule) gameData.roulette.push(rule)

    // kvMap
    for (const [key, v1, v2] of game.kvMap) {

        switch (key) {
            case "рулетка":
                gameData.roulette.push(v1)
                break

            // render start icon for each challenge completed
            case "челлендж":
                // [playerName, challengeText]
                if (!gameData.challenges) gameData.challenges = {}
                if (!gameData.challenges[v1]) gameData.challenges[v1] = []
                gameData.challenges[v1].push(v2)
                break

            case "replay":
                gameData.replay = v1
                break
        }
    }

    // town, starters, color
    const bluePlayer = Object.entries(game.data).find(nameAndData => nameAndData[1].color === "blue")[0]
    gameData.blue = series.players.indexOf(bluePlayer)
    gameData.towns = series.players.map(p => game.data[p].town)
    gameData.starters = series.players.map(p => game.data[p].starter)

    return gameData
}

export default { series, game }