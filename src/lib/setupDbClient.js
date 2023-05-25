import faunadb from 'faunadb';
import netlifyIdentity from 'netlify-identity-widget';


/**
 * Helper for requesting Netlify functions
 * @param {string} functionName 
 * @param {object?} fetchOptions 
 */
export async function netlifyFetch(functionName, fetchOptions) {

    // ask for athorization
    const user = netlifyIdentity.currentUser();
    if (!user) {
        console.warn("User is not authorized.")
        await new Promise(resolve => {

            netlifyIdentity.open()
            netlifyIdentity.on("login", () => {
                netlifyIdentity.close()
                resolve()
            })
        })
    }

    // refresh token
    // request with expired token will be rejected by serverless function
    const timeLeft = user.token.expires_at - Date.now()
    if (timeLeft < 5 * 60 * 1000) {
        console.log("Refreshing JWT")
        await netlifyIdentity.refresh(true)
    }

    const headers = { Authorization: `Bearer ${user.token.access_token}` };
    const response = await fetch(
        ".netlify/functions/" + functionName,
        { ...fetchOptions, headers: { ...fetchOptions?.headers, ...headers } }
    ).catch(err => err)

    if (response.ok) return response.json()
    throw new Error(`Error calling Function ${functionName}: ${await response.text()}`)
}

/** Helper for requesting Fauna editor key */
async function getSecret() {

    const storageKey = 'fauna--editor-key';
    const storedData = JSON.parse(localStorage.getItem(storageKey));

    const msLeft = (storedData?.expires ?? 0) - Date.now()
    if (msLeft / 1000 / 60 / 60 > 1) return storedData.secret

    // refresh secret
    console.log('Fauna key expired ot did not exist. Fetching new one...');

    // request new secret from netlify function
    const data = await netlifyFetch('getEditorKey')

    console.log('Successfully fetched new Fauna key.');
    localStorage.setItem(storageKey, JSON.stringify(data));

    return data.secret
}

/** @param {(status:"ok"|"pending"|"error", error?: Error) => void} setStatus */
export function setupDbClient(setStatus) {

    /**
     * Refresh key if necessary and Query Fauna for data/updates.
     */
    async function dbQuery(queryData) {
        setStatus('pending')
        try {
            const secret = await getSecret();
            const client = new faunadb.Client({ secret, scheme: 'https' });
            const result = await client.query(queryData);
            setStatus('ok')
            return { ok: true, result }

        } catch (error) {
            setStatus("error", error);
            return { ok: false, error, resetStatus: () => setStatus("ok") }
        }
    }

    /** Call "updateData" function configured in "setupFauna.js" */
    function updateData(data) {

        setStatus("pending")

        // production
        if (!localStorage.getItem("fauna--saving-disabled")) {
            return dbQuery(faunadb.query.Call('updateData', data))
        }

        // dev - wait for 1s then resolve
        console.log("Fauna has been disabled.", { data })
        return new Promise(resolve => {

            setTimeout(() => {
                setStatus('ok')
                resolve({ ok: true, result: {} })
            }, 1000)
        })
    }

    /** Call "getData" function configured in "setupFauna.js" */
    async function getData() {

        // production
        if (!localStorage.getItem('fauna--fetching-disabled')) {
            return dbQuery(faunadb.query.Call('getData', null))
        }

        // dev
        const savedData = JSON.parse(localStorage.getItem('fauna-stuff'));
        if (savedData?.tourneyData) return { ok: true, result: savedData }

        const response = await dbQuery(faunadb.query.Call('getData', null))
        if (response.ok) localStorage.setItem('fauna-stuff', JSON.stringify(response.result))
        return response
    }

    // Fauna configuration can be found in "setupFauna.js" in root folder
    return { getData, updateData };
}