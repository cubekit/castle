import _ from 'lodash'
import React from 'react'
import Maker from '../Utils/Maker'


/**
 * It's a decorator for injecting instances from the
 * `app` container to the decorated components.
 *
 * @example
 *
 * import inject from 'Packages/IoC/Containers/inject`
 * import TimeUtils from 'Utils/Time'
 *
 * \@inject([TimeUtils])
 * class TodayBanner extends React.Component {
 *     static propTypes = {
 *         timeUtils: React.PropTypes.object.isRequired,
 *     }
 *
 *     render() {
 *         return <div>{this.props.timeUtils.today()}</div>
 *     }
 * }
 *
 * @param {Array|Object} types
 */
const inject = (types) => (Component) => {

    class Injector extends React.Component {
        static contextTypes = {
            app: React.PropTypes.object.isRequired,
        }

        constructor(...args) {
            super(...args)
            const { app } = this.context
            this._injections = app.make(Maker).make(app, types)
        }

        render() {
            return (
                <Component
                    {...this._injections}
                    {...this.props}
                />
            )
        }
    }

    return Injector
}

export default inject