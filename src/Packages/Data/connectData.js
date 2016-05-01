import _ from 'lodash'
import { Map } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import dataShape from './dataShape'


// We use the class for debug purposes
const EMPTY_VARS = new (class EmptyVars {})

/**
 * @example
 *
 * connectData({
 *     // It is initial vars, they will be calculated
 *     // only once, at the component construction stage.
 *     // Consider it as an initial state from a Redux
 *     // reducer, but for variables.
 *     //
 *     // This variables will be converted to an Immutable.Map
 *     // instance, and `reduceVars` will receive it instead
 *     // of the original plain object.
 *     //
 *     // It also can be a plain object instead of factory.
 *     vars: () => {
 *         return {
 *             fromDate: moment.getCurrent()
 *         }
 *     },
 *
 *     // `vars` - is an Immutable.Map instance. It contains
 *     // previous variables, or initial, if previous does
 *     // not exist.
 *     // `props` - is the current props. It can be an initial
 *     // props, if this reducer called at the mounting stage
 *     // or new props, if it called from `componentWillReceiveProps`.
 *     //
 *     // This reducer should modify `vars` according to the
 *     // current `props`. If the previous `vars` will not be
 *     // changed after this operation, then nothing will happen.
 *     // But if vars is changed, then @connectData will request
 *     // data with the new variables.
 *     //
 *     // You can also return something falsy, if you do not want
 *     // to fetch. It will not override the last variables.
 *     reduceVars: (vars, props) => {
 *         if (props.profileId) {
 *             // For example, one widget can not fetch the data
 *             // until user has not selected some profile in another
 *             // widget. So, while it still empty, we do nothing
 *             return null
 *         }
 *
 *         return vars.merge({
 *             // We does not have to compare current `profileId` with
 *             // the `profileId` in `vars`, because it is an immutable
 *             // object.
 *             // It means, when you do the merge and new values equals
 *             // previous, then the same object will be returned. See
 *             // {@link https://facebook.github.io/immutable-js/docs/#/}
 *             // for details.
 *             profileId: props.profileId,
 *         })
 *     }
 * })
 *
 * @param options
 * @param options.name Name of the query
 * @param {function|Object} [options.vars] The initial variables
 * @param {function} [options.reduceVars=null] A function to reduce `vars` according to the current `props`
 * @param [options.canRenderEmpty=false] If this is true then your component can render itself without any data
 * @param [options.canRenderLoading=false] Set this to `true` if your your component can be rendered during loading before the data has loaded
 * @param [options.canRenderErrors=false] Set this to `true` if your component can be rendered when loading has failed
 * @param [options.fetchOnMount=true] Set it to `false` if you want to fetch only when `updateVars` returns new `vars` or when component calls `forceUpdate` directly
 * @param {function(props: Object): Boolean} [options.canRender]
 */
const connectData = (options) => (Component) => {

    const {
        name,
        vars,
        reduceVars,
        canRenderEmpty,
        canRenderLoading,
        canRenderErrors,
        canRender = defaultCanRender,
    } = options

    function defaultCanRender(props) {
        return canRenderEmpty
            ? !! _.get(props, 'data')
            : !! _.get(props, 'data.content')
    }

    @connect((state, { dataName }) => {
        return {
            data: state.data.queries[dataName || name],
        }
    })
    class DataConnector extends React.Component {

        static propTypes = {
            data: React.PropTypes.shape(dataShape),
            dataName: React.PropTypes.string,
            dispatch: React.PropTypes.func.isRequired,
        }

        static contextTypes = {
            queries: React.PropTypes.object.isRequired,
        }

        static defaultProps = {
            dataName: name,
        }

        constructor(...args) {
            super(...args)
            this._initVars = new Map(this._calcInitVars(vars))
        }

        /**
         * Initial variables, given at the decoration stage.
         *
         * @type {Object}
         * @private
         */
        _initVars = null

        /**
         * Variables used in the last query.
         *
         * @type {Object}
         * @private
         */
        _vars = null

        componentWillMount() {
            this._tryUpdateVars(this.props)
        }

        componentDidUpdate() {
            this._tryUpdateVars(this.props)
        }

        /**
         * If `reduceVars` exists, we call it with the
         * old vars and the current props.
         *
         * If it will return the same variables or something
         * falsy - we do nothing.
         *
         * If it will return new `vars` object, it means that
         * something in props has changed and we must re-fetch
         * the data using the new variables.
         *
         * @param {Object} props
         * @private
         */
        _tryUpdateVars(props) {
            // See description of the method
            this._syncVars(props)

            const prevVars = this._getPrevVars()
            const nextVars = (reduceVars)
                ? reduceVars(prevVars, props)
                : prevVars

            if (nextVars) {
                this._setVarsIfNeeded(nextVars)
            }
        }

        /**
         * Before trying to update the `vars`, we must sync
         * them with the `vars` from the state, because
         * some other component can already has changed it.
         *
         * @param data
         * @private
         */
        _syncVars({ data = {} }) {
            if (data.vars && data.vars != EMPTY_VARS) {
                const vars = this._getPrevVars()
                this._vars = vars.merge(data.vars)
            }
        }

        _setVarsIfNeeded(nextVars) {
            if (nextVars != this._vars) {
                this._setVars(nextVars)
            }
        }

        render() {
            if (this._shouldRender()) {
                return (
                    <Component
                        {...this.props}
                        {...this.props.data}
                        setVars={this._setVars}
                        mergeVars={this._mergeVars}
                        replaceVars={this._replaceVars}
                        forceUpdate={this._forceUpdate}
                        onClear={this._clear}
                        onCreate={this._create}
                        onUpdate={this._update}
                        onRemove={this._remove}
                        onEdit={this._edit}
                        onSave={this._save}
                    />
                )
            }

            return null
        }

        /**
         * Re-run query with the last used variables.
         * Useful for a `refresh` button, for example.
         *
         * @private
         */
        _forceUpdate = () => {
            this._setVars(this._vars)
        }

        _fetch = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.fetch({
                name: this.props.dataName,
                ...params,
            }))
        }

        _clear = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.clear({
                name: this.props.dataName,
                ...params,
            }))
        }

        _create = () => {
            const query = this._getQuery()

            return this.props.dispatch(query.create({
                name: this.props.dataName,
            }))
        }

        _update = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.update({
                name: this.props.dataName,
                ...params,
            }))
        }

        _remove = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.remove({
                name: this.props.dataName,
                ...params,
            }))
        }

        _edit = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.edit({
                name: this.props.dataName,
                ...params,
            }))
        }

        _save = (params) => {
            const query = this._getQuery()

            return this.props.dispatch(query.save({
                name: this.props.dataName,
                ...params,
            }))
        }

        _setVars = (vars) => {
            this._vars = vars

            return (this._vars == EMPTY_VARS)
                ? this._clear({ vars: this._vars })
                : this._fetch({ vars: this._vars.toObject() })
        }

        _replaceVars = (vars) => {
            return this._setVars(new Map(vars))
        }

        _mergeVars = (vars) => {
            return this._setVars(this._vars.merge(vars))
        }

        _calcInitVars(vars) {
            if (_.isFunction(vars)) {
                return vars(this.props)
            }

            return vars
        }

        _getQuery() {
            const { dataName } = this.props
            const query = this.context.queries[dataName]

            if (!query) {
                throw new Error(`Query with the "${dataName}" name is not defined.`)
            }

            return query
        }

        _shouldRender() {
            return (
                canRender(this.props)
                || canRenderLoading && this._isLoading()
                || canRenderErrors && this._hasErrors()
            )
        }

        _isLoading() {
            return _.get(this.props.data, 'loading')
        }

        _hasErrors() {
            return _.get(this.props.data, 'errors')
        }

        _getPrevVars() {
            if (this._vars && this._vars != EMPTY_VARS) {
                return this._vars
            }

            return this._initVars
        }
    }

    return DataConnector
}

connectData.EMPTY_VARS = EMPTY_VARS

export default connectData