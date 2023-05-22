/* eslint-disable no-unused-vars */
import faunadb from "faunadb"
import * as dotenv from 'dotenv'

dotenv.config()
const q = faunadb.query

const client = new faunadb.Client({
    secret: process.env.FAUNA_ADMIN_KEY,
    scheme: 'https',
})

const indexes = {
    Tourneys_sorted_by_update_time: {
        source: {
            collection: q.Collection("Tourneys"),
            fields: {
                tsInMillis: q.Query(doc => q.ToMillis(q.Select("ts", doc)))
            }
        },
        values: [
            { binding: "tsInMillis", reverse: true },
            { field: ["data", "name"] },
            { field: ["ref", "id"] }
        ]
    },
    Series_by_tourney: {
        source: q.Collection("Series"),
        terms: [
            { field: ["data", "tourneyId"] }
        ]
    }
}

const functions = {
    createEditorKey: q.Query(
        name => q.Let(
            {
                key: q.CreateKey({
                    role: [q.Role("Editor")],
                    ttl: q.TimeAdd(q.Now(), 1, "day"),
                    data: { date: q.Now(), name }
                })
            },
            {
                secret: q.Select("secret", q.Var("key")),
                expires: q.ToMillis(q.Select("ttl", q.Var("key")))
            }
        )
    ),
    updateTourney: q.Query(
        (id, data) => q.Update(
            q.Ref(q.Collection("Tourneys"), id),
            {
                // remove immutables from updater
                data: q.ToObject(
                    q.Filter(
                        q.ToArray(data),
                        entry => q.Not(q.ContainsValue(
                            q.Select(0, entry),
                            ["playersTotal", "templateCode", "withTop3"]
                        ))

                    )
                )
            }
        )
    ),
    createOrUpdateSeries: q.Query(
        data => q.Let(
            {
                id: q.Select("id", data, null),
                ref: q.If(
                    q.IsNull(q.Var("id")),
                    null,
                    q.Ref(q.Collection("Series"), q.Var("id"))
                ),
                innerData: q.Merge(data, { id: null })
            },
            q.Select(
                ["ref", "id"],
                q.If(
                    q.And(
                        q.Not(q.IsNull(q.Var("ref"))),
                        q.Exists(q.Var("ref"))
                    ),
                    q.Replace(q.Var("ref"), { data: q.Var("innerData") }),
                    q.Create(q.Collection("Series"), { data: q.Var("innerData") })
                )
            )
        )
    ),
    updateData: q.Query(
        data => ({
            tourney: q.If(
                q.ContainsField("tourney", data),
                q.Do(q.Call("updateTourney", q.Select("tourney", data)), "ok"),
                "ok"
            ),
            series: q.If(
                q.ContainsField("series", data),
                q.Do(q.Call("createOrUpdateSeries", q.Select("series", data)), "ok"),
                "ok"
            )
        })
    ),
    getTourneyList: q.Query(
        q.Lambda([], q.Select("data", q.Paginate(q.Match("Tourneys_sorted_by_update_time"), { size: 100000 })))
    ),
    getTourneyData: q.Query(
        id => q.Let(
            {
                ref: q.Ref(q.Collection("Tourneys"), id),
            },
            q.If(q.Exists(q.Var("ref")),
                {
                    tourney: q.Get(q.Var("ref")),
                    sList: q.Map(
                        q.Select("data", q.Paginate(q.Match("Series_by_tourney", id), { size: 100000 })),
                        sRef => q.Let(
                            {
                                series: q.Get(sRef)
                            },
                            q.Merge(
                                q.Select("data", q.Var("series")),
                                { id: q.Select(["ref", "id"], q.Var("series")) }
                            )
                        )
                    )
                },
                null
            )
        )
    ),
    getData: q.Query(
        id => q.Let(
            {
                // @type {[timestamp, name, id][]}
                list: q.Call("getTourneyList")
            },
            {
                tourneyList: q.Var("list"),
                tourneyData: q.If(
                    q.Not(q.IsNull(id)),

                    // requested tourney
                    q.Call("getTourneyData", id),

                    // recently updated
                    q.Call("getTourneyData",
                        q.If(
                            q.IsNonEmpty(q.Var("list")),
                            q.Select([0, 2], q.Var("list")),  // "0,2" is id of first tourney
                            null
                        )
                    )
                )
            }
        )
    )
}


function createIndexes() {
    const dos = []

    for (const name in indexes) {
        dos.push(q.CreateIndex({ name, ...indexes[name] }))
    }

    return q.Do(...dos)
}

function updateFunctions() {

    const dos = []

    for (const name in functions) {
        dos.push(
            q.If(q.Exists(q.Function(name)),
                q.Update(q.Function(name), { role: "server", body: functions[name] }),
                q.CreateFunction({ name, role: "server", body: functions[name] })
            )
        )
    }

    return q.Do(...dos)
}


client.query(
    // q.CreateIndex({ name: "Tourneys_sorted_by_update_time", ...indexes["Tourneys_sorted_by_update_time"] })
    // updateFunctions()

    q.Call("getData", null)
)
    .then(resp => console.log(resp))
    .catch(console.error)