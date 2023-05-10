import type { Player } from "../types"

const playerList: Player[] = []
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
const names: Set<string> = new Set([])

const pick = (arr: Array<string>) => {

    const r = Math.round(Math.random() * ((arr === nouns ? nl : al) - 1))

    const word = arr[r]
    return word[0].toUpperCase() + word.slice(1)
}

for (let i = 0; i < 24; i++) {

    let name = [pick(adjectives), pick(nouns)].join(" ")
    while (names.has(name)) name = [pick(adjectives), pick(nouns)].join(" ")

    names.add(name)
    playerList.push({ name, media: {} })
}

export default playerList