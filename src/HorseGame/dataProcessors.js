import { validateUrl } from "../lib/utils"
import kvOptions from "./adminParts/kvOptions"


function player(playerData) {

    const [platform, userName] = Object.entries(playerData.media)[0]

    switch (platform) {
        case "twitch":
            return `https://www.twitch.tv/${userName}`

        // youtube
        // someOtherTube

        default:
            console.error(`Player processor, unknown platform - "${platform}"`)
            return "/"
    }
}

/**
 * @param {{
 *  series: import("../types").Series,
 *  tourney: import("../lib/Tourney").Tourney,
 *  round: number,
 *  sIndex: number
 * }} args
 */
function series({ series }) {

    const data = {}

    for (const [key, v1, /*v2*/] of series.kvMap) {
        switch (key) {
            // render clock icon to tell that game date has been defined
            case "начало": {
                // extract from "YYYY-MM-DDThh:mm"
                const parts = /\d{4}-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(v1)
                if (!parts) break

                // ignore if series is over
                if (series.winner) break

                // or if game is being played
                if (series.games.some(g => !g.winner)) break

                const [, m, d, t] = parts
                data.start = `${d}.${m} в ${t}`
                break
            }
        }
    }

    return data
}

function game({ game, series, tourney }) {

    const gameData = { roulette: [] }

    // add condition common fo all games in round
    const rule = tourney.data.commonRules?.[series.round]
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

            case "запись игры":
                if (!validateUrl(v1, kvOptions.game["запись игры"].fields[0].allowed)) break
                gameData.replay = v1.replace(/^(https:\/\/)?(www\.)?/, "https://www.")
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

export default { player, series, game }