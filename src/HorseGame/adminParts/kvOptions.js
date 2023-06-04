export default {
    game: {
        "рулетка": {
            label: "Рулетка",
            fields: [
                { type: "text" }
            ]
        },
        "челлендж": {
            label: "Челлендж",
            fields: [
                { type: "playerSelect" },
                { type: "text" }
            ]
        },
        "запись игры": {
            label: "Запись игры",
            fields: [
                { type: "url", allowed: ["youtube.com", "twitch.tv"] }
            ],
            unique: true
        }
    },
    series: {
        "начало": {
            label: "Время игры",
            fields: [
                {
                    type: "datetime",
                    initialTime: "22:00"
                }
            ],
            unique: true
        }
    }
}