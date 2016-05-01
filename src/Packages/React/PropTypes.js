import _ from 'lodash'
import { PropTypes } from 'react'


/**
 * Example:
 *
 * ```
 * class TestComponent extends React.Component {
 *     static propTypes = {
 *         severity: React.PropTypes.oneOfType([
 *             React.PropTypes.equals({ code: 3000 }),
 *             React.PropTypes.equals({ code: 2000 }),
 *             React.PropTypes.equals({ code: 1000 }),
 *         ]).isRequired,
 *     }
 * }
 *
 * @param {*} value
 * @returns {Function}
 */
PropTypes.equals = function(value) {
    return function(props, propName) {
        const prop = props[propName]

        if (!_.isEqual(prop, value)) {
            const propJson = JSON.stringify(prop)
            const valueJson = JSON.stringify(value)
            return new Error(
                `Value "${propJson}" of "${propName}" does not equals "${valueJson}"`
            )
        }
    }
}

export default PropTypes