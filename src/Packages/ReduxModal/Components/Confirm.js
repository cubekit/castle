import _ from 'lodash'
import React from 'react'
import { connectModal } from 'redux-modal'
import { approve, decline } from 'Packages/ReduxModal/confirmation'

import TextCenter from 'Components/TextCenter'
import Button from 'Components/Button'
import { Alert } from './Alert'


@connectModal({ name: 'confirm' })
class Confirm extends React.Component {

    static propTypes = {
        title: React.PropTypes.string,
    }

    static contextTypes = {
        store: React.PropTypes.object.isRequired,
    }

    static defaultProps = {
        title: 'Подтверждение действия',
    }

    render() {
        return (
            <Alert
                {...this.props}
                handleHide={_.noop}
                hideCloseButton={true}
            >
                <TextCenter>
                    <Button color="green" onClick={this._approve}>
                        Да
                    </Button>
                    <Button color="red" onClick={this._decline}>
                        Отмена
                    </Button>
                </TextCenter>
            </Alert>
        )
    }

    _approve = () => {
        this.context.store.dispatch(approve())
    }

    _decline = () => {
        this.context.store.dispatch(decline())
    }
}

export default Confirm