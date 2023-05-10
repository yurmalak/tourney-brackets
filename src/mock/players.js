/** @typedef {import('../types.ts').Player} Player */

/** @type {Player[]}  */
const playerList = []
const adjectives = [
    "smelly",
    "clean",
    "funny",
    "lazy",
    "tin",
    "furry",
    "holy",
    "red",
    "blue",
    "tasty"
]
const nouns = [
    "socks",
    "apple",
    "pear",
    "nose",
    "cat",
    "dog",
    "rat",
    "fish",
    "leg",
    "boat"
]

const al = adjectives.length
const nl = nouns.length

/** @type {Set<string>} */
const names = new Set([])

const pick = (arr) => {

    const r = Math.round(Math.random() * ((arr === nouns ? nl : al) - 1))

    const word = arr[r]
    return word[0].toUpperCase() + word.slice(1)
}

for (let i = 0; i < 24; i++) {

    let name = [pick(adjectives), pick(nouns)].join(" ")
    while (names.has(name)) name = [pick(adjectives), pick(nouns)].join(" ")

    names.add(name)

    /** @type {Player} */
    const player = { name, media: {} }
    playerList.push(player)
}

export default playerList