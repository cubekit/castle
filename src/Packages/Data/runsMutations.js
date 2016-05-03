import React from 'react'
import { Promise } from 'es6-promise'
import getDisplayName from 'react-display-name'
import { runMutation } from './actions'


const runsMutations = () => (Component) => {

    /**
     * It's a container for components which allows them
     * to run mutations and track their progress.
     *
     * The wrapped component will receive the next props:
     *
     * `runMutation` - a function, which accepts a mutation class
     * and arbitrary count of arguments, which will be passed to
     * the `Mutation#run` method.
     *
     * `mutating` - a boolean variable which indicates that some
     * mutation is in progress. It's likely that you want to disabled
     * some button until it's done or something like that.
     */
    class RunsMutations extends React.Component {

        static displayName = `RunsMutations(${getDisplayName(Component)})`

        static contextTypes = {
            app: React.PropTypes.object.isRequired,
            store: React.PropTypes.object.isRequired,
        }

        state = {
            /**
             * Is some mutation in progress right now?
             */
            mutating: false,
        }

        /**
         * If we change `state` of an unmounted component, then
         * React throws a warning about it. So we check is the
         * component still mounted, when mutation is done and
         * we need to set the `mutating` to `false`.
         *
         * @protected
         */
        componentDidMount() {
            this._mounted = true
        }

        /**
         * @protected
         */
        componentWillUnmount() {
            this._mounted = false
        }

        render() {
            return (
                <Component
                    {...this.props}
                    runMutation={this._runMutation}
                    mutating={this.state.mutating}
                />
            )
        }

        /**
         * @param {Function} Mutation
         * @param {Object} params
         * @returns {Promise}
         * @private
         */
        _runMutation = (Mutation, params) => {
            const { store, app } = this.context
            const mutation = app.make(Mutation)
            const action = runMutation(mutation, params)

            this.setState({ mutating: true })

            const result = Promise.resolve(store.dispatch(action))
            return result.then((result) => {
                this._endMutating()
                return result
            }, (error) => {
                this._endMutating()
                throw error
            })
        }

        /**
         * Set `state.mutating` to `false`, if the component
         * still mounted.
         *
         * @private
         */
        _endMutating() {
            if (this._mounted) {
                this.setState({ mutating: false })
            }
        }
    }

    return RunsMutations
}

export default runsMutations