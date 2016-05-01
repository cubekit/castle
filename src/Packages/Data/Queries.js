import * as actions from './actions'


/**
 * It's a base class for all query classes. It
 * implements all the base CRUD methods, like
 * `create`, `update`, etc.
 *
 * By default all this methods just a proxy for an
 * action with the same name.
 *
 * Specific classes can override any method to
 * implement some specific query logic.
 *
 * # Query-methods - `${action}Query`
 *
 * All data actions support the next signature
 * for async queries:
 *
 * ```
 * action(params, {
 *     query: someAsyncFunction,
 * })
 * ```
 *
 * And if you are overriding the base methods only
 * to use this feature and add the `query` function
 * to params, you can do that in a more shortly way:
 * by adding a query-method with a specific name.
 *
 * Example:
 *
 * ```
 * // This classes are conceptually equivalent
 *
 * class MyQueriesLong extends Queries {
 *     fetch(params) {
 *         return super.fetch(params, {
 *             query: () => doAsyncCall(params.data),
 *         })
 *     }
 * }
 *
 * class MyQueriesShort extends Queries {
 *     // This function will be added automatically
 *     // as a `query` parameter in the `fetch` action,
 *     // like it was done in the previous class
 *     fetchQuery(params) {
 *         return doAsyncCall(params.data)
 *     }
 * }
 * ```
 */
export default class Queries {

    runAction(actionName, ...args) {
        const [params, asyncParams] = args
        const query = _.get(asyncParams, 'query')

        return this._actions[actionName](params, {
            ...asyncParams,
            query: query || this._makeQuery(actionName, args),
        })
    }

    /**
     * Shortcut for `queries.runAction('fetch', ...args)`
     *
     * @param args
     * @returns {*}
     */
    fetch(...args) {
        return this.runAction('fetch', ...args)
    }

    /**
     * Shortcut for `queries.runAction('clear', ...args)`
     *
     * @param args
     * @returns {*}
     */
    clear(...args) {
        return this.runAction('clear', ...args)
    }

    /**
     * Shortcut for `queries.runAction('update', ...args)`
     *
     * @param args
     * @returns {*}
     */
    update(...args) {
        return this.runAction('update', ...args)
    }

    /**
     * Shortcut for `queries.runAction('remove', ...args)`
     *
     * @param args
     * @returns {*}
     */
    remove(...args) {
        return this.runAction('remove', ...args)
    }

    /**
     * Shortcut for `queries.runAction('create', ...args)`
     *
     * @param args
     * @returns {*}
     */
    create(...args) {
        return this.runAction('create', ...args)
    }

    /**
     * Shortcut for `queries.runAction('edit', ...args)`
     *
     * @param args
     * @returns {*}
     */
    edit(...args) {
        return this.runAction('edit', ...args)
    }

    /**
     * Shortcut for `queries.runAction('save', ...args)`
     *
     * @param args
     * @returns {*}
     */
    save(...args) {
        return this.runAction('save', ...args)
    }

    /**
     * Shortcut for `queries.runAction('save', ...args)`
     *
     * @param args
     * @returns {*}
     */
    store(...args) {
        return this.runAction('store', ...args)
    }

    /**
     * Use it if you want to redefined the actions
     * for a testing purpose.
     *
     * @param {Object} actions
     */
    setActions(actions) {
        this._actions = actions
    }

    /**
     * @type {Object}
     * @private
     */
    _actions = actions

    /**
     * @param {string} actionName
     * @param {...} args
     * @returns {Function}
     * @private
     */
    _makeQuery(actionName, args) {
        const methodName = `${actionName}Query`

        if (methodName in this) {
            return () => this[methodName](...args)
        }
    }
}