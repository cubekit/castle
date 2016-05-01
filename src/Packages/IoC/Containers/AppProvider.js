import _ from 'lodash'
import React from 'react'
import { Provider } from 'react-redux'


class AppProvider extends React.Component {

    static propTypes = {
        app: React.PropTypes.object.isRequired,
        store: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        app: React.PropTypes.object.isRequired,
    }

    getChildContext() {
        return { app: this.props.app }
    }

    render() {
        const { store, children } = this.props

        return (
            <Provider store={store}>
                {children}
            </Provider>
        )
    }
}

export default AppProvider