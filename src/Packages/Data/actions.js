import _ from 'lodash'
import isPromise from 'is-promise'
import { Promise } from 'es6-promise'
import { initialize } from 'redux-form'
import { show, hide } from 'redux-modal/lib/actions'
import { confirm } from '../ReduxModal/confirmation'


/**
 * If data is in `loading` state, than action will do nothing.
 *
 * @param params
 * @param {string} params.name
 * @param {Object} params.vars
 * @param {*} [params.content] Any content
 *
 * @param {Object} [asyncParams]
 * @param {Function} [asyncParams.query] May return a promise or any content. Has higher priority than `content`
 *
 * @returns {Function}
 */
export function fetch(params, asyncParams = {}) {
    return (dispatch, getState) => {
        const { name } = params
        const data = getState().data[name]

        if (!_.get(data, 'loading')) {
            const { content, vars } = params
            const { query } = asyncParams
            const result = query ? query() : content

            if (isPromise(result)) {
                dispatch(fetchStart({ name, vars }))

                result.then(({ content, vars }) => {
                    dispatch(fetchSuccess({ name, content, vars }))
                }, (error) => {
                    // For the debug purposes. Remove it, when the
                    // error system will be done.
                    console.error(error)

                    dispatch(fetchFail({ name, error }))
                })
            } else {
                dispatch(fetchSuccess({
                    name,
                    vars,
                    content: result,
                }))
            }
        }
    }
}

/**
 * Takes a migration, runs it, and applies its changes
 * when it has done.
 *
 * @param {Packages.Data.MutationBase} mutation
 * @param {Object} [params]
 */
export function runMutation(mutation, params) {
    return mutation.asAction(params)
}

/**
 * Clear all records for the given name in the app state.
 *
 * @param params
 */
export function clear(params) {
    const { name, vars } = params

    return {
        name,
        type: '@data/CLEAR',
        payload: { vars },
    }
}

/**
 * Called when `query` returned a promise. It means
 * that query is async and we should set the `loading`
 * state to true.
 *
 * @param {string} name
 * @param {Object} vars
 * @returns {{name: *, type: string}}
 */
export function fetchStart({ name, vars }) {
    return {
        name,
        type: '@data/FETCH_START',
        payload: { vars },
    }
}

/**
 * Called when data successfully loaded. If data was
 * provided synchronously, then this acton will be
 * called immediately, without `fetchStart`.
 *
 * @param {string} name
 * @param {Object} vars
 * @param {*} content
 * @returns {Object}
 */
export function fetchSuccess({ name, vars, content }) {
    return {
        name,
        type: '@data/FETCH_SUCCESS',
        payload: { vars, content },
    }
}

/**
 * Works only for async fetches. If promise resolved
 * to an error, then this action will be called.
 *
 * @param {string} name
 * @param {Object} error
 * @returns {Object}
 */
export function fetchFail({ name, error }) {
    return {
        name,
        type: '@data/FETCH_FAIL',
        payload: { errors: [error] },
    }
}

export function create({ name }) {
    return (dispatch) => {
        // Initialize a form and modal with this name.
        // It's OK if form or modal does not exist,
        // but it's a very common situation in the app
        // (modal + form to create a record somewhere),
        // so we consider it as a default scenario.
        dispatch(initialize(name, {}))
        dispatch(show(name))
    }
}


export function edit({ name, data }) {
    return (dispatch) => {
        // Initialize a form and modal with this name.
        // It's OK if form or modal does not exist,
        // but it's a very common situation in the app
        // (modal + form to edit a record somewhere),
        // so we consider it as a default scenario.
        dispatch(initialize(name, data, _.keys(data)))
        dispatch(show(name))
    }
}

/**
 * Use this function to update or create a record.
 *
 * If the record has no ID, then it will be added to
 * the data list in the app state after saving, but
 * if it does, then object with the same ID in the
 * list will be updated with the new values.
 *
 * If you want you can define the `query` function,
 * which supposed to do some async query to save the
 * record on the server.
 *
 * This function must return a Promise, resolved
 * by an object with the `data` key. This data
 * will be used to add or update the local state,
 * not the data from `params`. But you still need
 * to pass `data` to params, because it's used to
 * determine what to do with the local state -
 * update existing record or create new.
 *
 * @example
 *
 * actions.save({
 *     name: 'courses',
 *     data: data,
 *
 *     // If you want the user to confirm the saving
 *     // of new values, you can define this parameter,
 *     // and he will be prompted with a modal. If
 *     // he will decline the saving, then action will
 *     // not be dispatched.
 *     confirmation: 'Are you sure?',
 * }, {
 *     query: () => {
 *         // Returns Promise<{ data: Object }>
 *         return this._courseApi.save(data)
 *     }
 * })
 *
 * @param params
 * @param {string} params.name Name of the entity
 * @param {Object} params.data New values
 * @param {string} [params.confirmation]
 *
 * @param {Object} [asyncParams]
 * @param {Function} [asyncParams.query]
 */
export function save(params, asyncParams) {
    const { name, data, confirmation } = params
    const { query } = asyncParams

    const runSave = (dispatch) => {
        const result = query ? query() : { data }

        return Promise.resolve(result).then((result) => {
            const { id } = data
            const action = (id)
                ? update({ id, name, data: result.data })
                : store({ name, data: result.data })

            return dispatch(action)
        })
    }

    if (confirmation) {
        return confirm(confirmation, () => runSave)
    } else {
        return runSave
    }
}

/**
 * NOTE: It is unlikely you need to use this action directly.
 * Check the `save` action instead.
 *
 * @param {string} params
 * @param {string} params.name
 * @param {Object} params.data
 *
 * @returns {Function}
 */
export function store(params) {
    const { name, data } = params

    return (dispatch) => {
        dispatch({
            name,
            type: '@data/STORE',
            payload: { data },
        })

        // It's a very common situation in the app
        // to edit something in a modal. So if this
        // "something" is updated or created, there
        // is a very big chance, that we must close
        // a modal with this name too.
        // So we consider it as a default scenario
        dispatch(hide(name))
    }
}

/**
 * NOTE: It is unlikely you need to use this action directly.
 * Check the `save` action instead.
 *
 * NOTE: This action updates values in some record which
 * already exists in the app state. We just search it by
 * the given `id`, and update its values with the new,
 * received in the `data` argument.
 *
 * But sometimes we need to update value of the `id`
 * field itself. It is the reason why we pass the `id`
 * argument separately and DO NOT USE `id` from `data`
 * to search the record.
 *
 * If we will use the `id` value from the `data` we
 * will NEVER find the record to update, because this
 * `id` is NEW (it is why we are trying to update it
 * in the state).
 *
 * In the other words, the `id` argument - it is the
 * CURRENT ID of the record to update, and `data` can
 * contain a NEW ID, which will replace the current
 * after update.
 *
 * @param {Object} params
 * @param {string} params.name Name of the entity
 * @param {Object} params.data New values
 * @param {Object} params.id Current ID of the record to update
 *
 * @returns {Function}
 */
export function update(params) {
    const { name, id, data } = params

    return (dispatch) => {
        dispatch({
            name,
            type: '@data/UPDATE',
            payload: { id, data },
        })

        // It's a very common situation in the app
        // to edit something in a modal. So if this
        // "something" is updated or created, there
        // is a very big chance, that we must close
        // a modal with this name too.
        // So we consider it as a default scenario
        dispatch(hide(name))
    }
}

/**
 * @example
 *
 * const action = remove({
 *     id: profile.id,
 *     name: 'profiles',
 * }, {
 *     // This function will be called only if
 *     // user confirmed the action. Define it
 *     // if you want to send some request to
 *     // remove the record on server. If you
 *     // have not defined this function, then
 *     // record will be removed from the app
 *     // state immediately after the confirmation.
 *     query: () => {
 *         return this.api.remove({ id: profile.id })
 *     }
 * })
 *
 * @param params
 * @param {string|number} params.id An unique ID of the record to detect it in the app state
 * @param {string} params.name Entity name
 *
 * @param {Object} [asyncParams]
 * @param {Function} [asyncParams.query] Function to be called before remove it from the app state
 *
 * @returns {Object}
 */
export function remove(params, asyncParams = {}) {
    const message = 'Вы уверены, что хотите удалить запись?'

    // We MUST ask for the user confirmation on ALL
    // destructive actions. So it is the default
    // scenario.
    return confirm(message, () => (dispatch) => {
        const { query } = asyncParams
        const { name, id } = params
        const result = query ? query() : true

        return Promise.resolve(result).then((result) => {
            dispatch({
                name,
                type: '@data/REMOVE',
                payload: { id },
            })

            return result
        })
    })
}