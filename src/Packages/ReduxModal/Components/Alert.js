import _ from 'lodash'
import React from 'react'
import { connectModal } from 'redux-modal'
import Popup from 'Components/Popup'
import TextCenter from 'Components/TextCenter'


/**
 * We export this component separately from
 * its connected version to be able to use it
 * as a base component in the `Confirmation` modal.
 *
 * Scroll to the bottom of the file to see the
 * connected version.
 */
export class Alert extends React.Component {

    static propTypes = {
        hideCloseButton: React.PropTypes.bool,
        handleHide: React.PropTypes.func.isRequired,
        message: React.PropTypes.string.isRequired,
        title: React.PropTypes.string,
        show: React.PropTypes.bool.isRequired,
    }

    static defaultProps = {
        title: 'Внимание',
    }

    render() {
        const {
            hideCloseButton,
            handleHide,
            message,
            title,
            show
        } = this.props

        if (!show) {
            return null
        }

        return (
            <Popup
                size="small"
                title={title}
                onClose={handleHide}
                hideCloseButton={hideCloseButton}
            >
                <TextCenter>{message}</TextCenter>
                {this.props.children}
            </Popup>
        )
    }
}

export default connectModal({ name: 'alert' })(Alert)