const fetch = require("node-fetch")

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

    const hookUrl = `https://api.netlify.com/build_hooks/${process.env.BUILD_HOOK}`
    await fetch(hookUrl, { method: "POST" })

    return {
        statusCode: 200,
        body: JSON.stringify("ok")
    }
}