export default {
    game: {
        "рулетка": {
            fields: [
                { type: "text" }
            ]
        },
        "челлендж": {
            fields: [
                { type: "playerSelect" },
                { type: "text" }
            ]
        },
        "запись игры": {
            fields: [
                { type: "url", allowed: ["youtube.com", "twitch.tv"] }
            ],
            unique: true
        }
    },
    series: {
        "начало": {
            fields: [
                { type: "text" }
            ],
            unique: true
        }
    }
}