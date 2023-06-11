import powersOf2 from "./PowersOf2/bundleSeries"


const bundlers = {
    powersOf2
}

export default function bundleSeries(tourney) {

    const { templateCode } = tourney.data
    const bundler = bundlers[templateCode]

    if (!bundler) {
        console.error("Wrong templateCode", tourney)
        throw new Error("Wrong templateCode - " + templateCode)
    }

    return bundler(tourney)
}