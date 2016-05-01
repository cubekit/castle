import _ from 'lodash'
import React from 'react'


/**
 * It's a helper component to pass `queries` through
 * the React context.
 *
 * Queries - it's a hash of classes where key is a
 * data type, and value is a class with different
 * actions for different requests.
 *
 * It's used with the `connectData` decorator. When
 * you define `dataKey` in it, it searches for the
 * action with the same key in `context.queries`,
 * and uses it to fetch the data.
 */
class QueriesProvider extends React.Component {

    static propTypes = {
        queries: React.PropTypes.objectOf(
            React.PropTypes.func.isRequired
        ).isRequired,
        children: React.PropTypes.func.isRequired,
    }

    static contextTypes = {
        // We need IoC to instantiate the queries
        app: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        queries: React.PropTypes.object.isRequired,
    }

    state = {
        queries: null,
    }

    componentWillMount() {
        this._updateQueries(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.queries != this.props.queries) {
            this._updateQueries(nextProps)
        }
    }

    _updateQueries({ queries }) {
        this.setState({
            queries: _.mapValues(queries, (QueriesClass) => {
                return this.context.app.make(QueriesClass)
            })
        })
    }

    getChildContext() {
        return {
            queries: this.state.queries,
        }
    }

    render() {
        return this.props.children()
    }
}

export default QueriesProvider