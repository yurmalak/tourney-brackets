import tourneyData from '../data/tourneyData';
/** @typedef {import("../../types").TourneyData} TourneyData*/

/**
 * Fetch from DB in the future. Get from file for now.
 * @returns {TourneyData}
 */
export default async function fetchData() {

    return tourneyData.data
}