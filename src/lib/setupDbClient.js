import faunadb from 'faunadb';
import netlifyIdentity from 'netlify-identity-widget';


async function getSecret() {

    const storageKey = 'fauna--editor-key';
    const storedData = JSON.parse(localStorage.getItem(storageKey));

    const msLeft = (storedData?.expires ?? 0) - Date.now()
    if (msLeft / 1000 / 60 / 60 > 1) return storedData.secret

    // refresh secret
    console.log('Fauna key expired ot did not exist. Fetching new one...');

    // request new secret from netlify function
    const user = netlifyIdentity.currentUser();
    const endpoint = '.netlify/functions/getEditorKey';
    const headers = { Authorization: `Bearer ${user.token.access_token}` };
    const response = await fetch(endpoint, { headers });

    let data
    if (response.status === 200) data = await response.json()
    else {
        window.netlifyIdentity = netlifyIdentity
        throw new Error(await response.text())
    }

    console.log('Successfully fetched new Fauna key.');
    localStorage.setItem(storageKey, JSON.stringify(data));

    return data.secret
}


export default function setupDbClient() {

    /**
     * @type {{
     *    status: 'ok'|'pending'|'error',
     *    queryData?: { tourney?: object, series?: Array },
     * 	  promise?: Promise,
     *    error?: Error,
     * 	  complete: () => void
     * }}
     */
    const normalState = { status: 'ok', error: null, queryData: null, promise: null, complete: resetTask };

    /**
     * Object with status of current query, its data and errors (if any)
     */
    const task = { ...normalState };
    function resetTask() {
        Object.assign(task, normalState);
    }

    /**
     * Refresh key if necessary and Query Fauna for data/updates.
     * @returns task object with awaitable `task.promise`
     */
    function dbQuery(queryData) {
        resetTask()
        task.status = 'pending';
        task.queryData = queryData;

        task.promise = getSecret()
            .then(secret => {

                const client = new faunadb.Client({ secret: secret, scheme: 'https' });
                return client.query(queryData);
            })
            .catch(error => {
                console.error('Failed to query Fauna', error);
                task.error = error;
                task.status = 'error';
                return task
            })

        return task;
    }

    // Fauna configuration can be found in "setupFauna.js" in root folder
    const client = {
        // returns specific tourney with provided id
        // or recently updated one if it's null
        getData: () => dbQuery(faunadb.query.Call('getData', null)),
        updateData: (data) => dbQuery(faunadb.query.Call('updateData', data))
    };


    return { task, client }
}