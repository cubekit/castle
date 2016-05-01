import { show, hide } from 'redux-modal/lib/actions'


/**
 * @example In a component
 *
 * // ...
 *
 * const message = 'Вы уверены, что хотите удалить лекарство?'
 * const action = confirm(message, () => {
 *     return remove('pills', this.props.data.id)
 * })
 *
 * this.props.dispatch(action)
 *
 * @example In an Action Creator
 *
 * // ...
 *
 * export function removePill(id) {
 *     const message = 'Вы уверены, что хотите удалить лекарство?'
 *     return confirm(message, () => {
 *         return {
 *             type: '@data/REMOVE',
 *             name: 'pills',
 *             payload: { id },
 *         }
 *     })
 * }
 *
 * @param message
 * @param actionCreator
 * @returns {Object}
 */
export function confirm(message, actionCreator) {
    if (_actionCreator) {
        throw new Error(
            'You are trying to call `confirm` but the ' +
            'previous confirmation have not finished yet.'
        )
    }

    _actionCreator = actionCreator

    // We must use the inversion to be able to return
    // a promise from this action
    return (dispatch) => {
        dispatch(show('confirm', { message }))

        // This promise will be resolved when user
        // declined or confirmed the action
        return new Promise((resolve) => {
            _resolvePromise = resolve
        })
    }
}


/**
 * It's a storage for the actionCreator which
 * must be called when confirmation is done.
 *
 * @type {Function}
 * @private
 */
let _actionCreator = null

/**
 * It's a Promise handler which will be called
 * immediately after the user confirmed or declined
 * the action.
 *
 * @type {Function}
 * @private
 */
let _resolvePromise = null

export function approve() {

    _checkConfirmIsCalledBefore('approve')

    return (dispatch) => {
        dispatch(hide('confirm'))

        let action = null

        try {
            action = dispatch(_actionCreator())
        } catch (e) {
            console.error(e)
            // We must not crash the confirmation system if
            // something went wrong during dispatching the
            // action, so we consider any fail as a decline.
            return dispatch(decline())
        }

        return Promise.resolve(action).then((result) => {
            _cleanState(result)
            return result
        })
    }
}

export function decline() {
    _checkConfirmIsCalledBefore('decline')
    _cleanState(false)
    return hide('confirm')
}

function _checkConfirmIsCalledBefore(calledAction) {
    if (!_actionCreator) {
        throw new Error(
            `You are trying to call \`${calledAction}\` but it ` +
            "looks like you didn't call `confirm` before that."
        )
    }
}

/**
 * Resolve the confirmation promise and cleanup
 * callbacks in the global state.
 *
 * @param {*} promiseResult
 * @private
 */
function _cleanState(promiseResult) {
    _resolvePromise(promiseResult)
    _actionCreator = null
    _actionCreator = null
}