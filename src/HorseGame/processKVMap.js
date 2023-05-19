

export default function processKVMap(series) {

    const data = {
        challenges: {},
        roulette: [],
        hide: {}
    }

    for (const [key, [v1, /*v2*/]] of series.kvMap) {
        switch (key) {
            // render clock icon to tell that game date has been defined
            case "начало":
                if (series.winner === undefined) data.start = v1
                break

            // hide nodes that currently overlap with static text on the image
            case "hide":

                // hide both if only the key has been provided
                if (!v1) {
                    data.hide[series.players[0].name] = true
                    data.hide[series.players[1].name] = true
                }
                else {
                    data.hide[v1] = true
                }
                break
        }
    }


    for (const game of series.games) {
        for (const [key, [v1, v2]] of game.kvMap) {
            switch (key) {

                // render start icon for each challenge completed
                case "челлендж":
                    // [playerName, challengeText]
                    (data.challenges[v1] || (data.challenges[v1] = [])).push(v2)
                    break

                case "рулетка":
                    data.roulette.push(v1)
                    break
            }
        }
    }

    return data
}