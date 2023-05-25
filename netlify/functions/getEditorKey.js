/* eslint-disable no-unused-vars */
const faunadb = require('faunadb')
const q = faunadb.query


exports.handler = async function (event, context) {

    const { user } = context.clientContext
    let error
    if (!user) {
        error = "No authorized user"
    }
    else if (!user.app_metadata.roles.includes("editor")) {
        error = "User does not have permission"
    }
    if (error) return {
        statusCode: 403,
        body: error
    }

    const userName = context.clientContext.user.user_metadata.full_name
    const client = new faunadb.Client({ secret: process.env.FAUNA_KEY })
    const response = await client.query(q.Call("createEditorKey", userName))

    return {
        statusCode: 200,
        body: JSON.stringify(response)
    }
}