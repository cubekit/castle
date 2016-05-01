import React from 'react'
import getDisplayName from 'react-display-name'


const checkbox = () => (Component) => {
    
    class Checkbox extends React.Component {

        static displayName = `Checkbox(${getDisplayName(Component)})`

        static propTypes = {
            checked: React.PropTypes.bool,
            onChange: React.PropTypes.func,
            submit: React.PropTypes.func,
            disabled: React.PropTypes.bool,
        }

        render() {
            return <Component {...this.props} toggle={this._toggle} />
        }

        _toggle = () => {
            const { onChange, checked, submit, disabled } = this.props

            if (!disabled) {
                if (onChange) {
                    onChange(!checked)
                }

                if (submit) {
                    submit()
                }
            }
        }

    }
    
    return Checkbox
}

export default checkbox