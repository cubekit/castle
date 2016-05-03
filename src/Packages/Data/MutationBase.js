import { update } from './actions'


/**
 * It's a base class for all mutations in the app.
 *
 * @class Packages.Data.MutationBase
 */
export default class MutationBase {

    /**
     * Default implementation for the mutate action. Code
     * for this behavior is placed in this class instead
     * of the `runMutation` to make it possible to override
     * this in derived classes.
     *
     * @memberOf Packages.Data.MutationBase
     * @returns {Function}
     */
    asAction(params) {
        return (dispatch) => {
            const result = Promise.resolve(this.run(params))

            return result.then((response) => {
                const changes = this.getChanges(response, params)

                _.each(changes, (dataHash, name) => {
                    _.each(dataHash, (data, id) => {
                        dispatch(update({ name, id, data }))
                    })
                })

                const afterAction = this.afterAction(params)

                if (afterAction) {
                    return dispatch(afterAction)
                }
            })
        }
    }

    /**
     * This method can run a request or do nothing.
     *
     * @memberOf Packages.Data.MutationBase
     * @abstract
     * @protected
     */
    run(params) { throw new Error('Not implemented') }

    /**
     * This method must return changes for the data
     * in the app state. Example:
     *
     * ```
     * return {
     *   user: {
     *     1: { confirmations: { passportData: true } },
     *   }
     * }
     * ```
     *
     * Also, this method will receive the result of `run`
     * method and the original `params`, passed to the
     * `runMutation` callback.
     *
     * @memberOf Packages.Data.MutationBase
     * @abstract
     * @protected
     */
    getChanges(response, params) { throw new Error('Not implemented') }

    /**
     * If you want to dispatch some action when your
     * mutation is done - just implement this method
     * and return the action from it.
     *
     * @memberOf Packages.Data.MutationBase
     * @protected
     */
    afterAction(params) { return null }
}