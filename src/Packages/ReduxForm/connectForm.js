import React from 'react'
import { reduxForm } from 'redux-form'
import getDisplayName from 'react-display-name'
import Validator from '../Validation/Validator'


/**
 * It's a wrapper around the `reduxForm` decorator
 * which adds some additional functionality.
 *
 * @param reduxFormParams See the redux-form docs for the list of options
 * @param [params]
 * @param [params.disableFieldsOnSubmit=true] Add `disabled` property to all fields when the form is submitting
 * @param [params.onFieldSubmit=null] Used for `submit` props in inputs
 * @param [params.shouldSubmit=null] Submit doesn't happen while this function returns true
 * @param [params.connectReduxForm=reduxForm] The original decorator of `reduxForm`. You can override it for tests purposes
 * @param [params.rules=null] Automatically creates the validate function from this rules
 */
function connectForm(reduxFormParams, params = {}) {

    const {
        disableFieldsOnSubmit = true,
        onFieldSubmit = null,
        shouldSubmit = null,
        connectReduxForm = reduxForm,
    } = params

    return (Component) => {
        const componentName = getDisplayName(Component)
        const displayName = `FormWrapper(${componentName})`
        const formParams = _populateParams(componentName, reduxFormParams, params)

        @connectReduxForm(formParams)
        class FormWrapper extends React.Component {

            static displayName = displayName

            static propTypes = {
                fields: React.PropTypes.object.isRequired,
                submitting: React.PropTypes.bool.isRequired,
            }

            componentWillMount() {
                this._updateFields(this.props)
            }

            componentWillReceiveProps(nextProps) {
                const shouldUpdateFields = (
                    nextProps.submitting != this.props.submitting
                )

                if (shouldUpdateFields) {
                    this._updateFields(nextProps)
                }
            }

            _updateFields(props) {
                _.each(props.fields, (field, name) => {
                    field.name = name
                    field.disabled = (disableFieldsOnSubmit && !! props.submitting)
                    field.submit = (onFieldSubmit ? this._onFieldSubmit : null)
                })
            }

            render() {
                return (
                    <Component
                        {...this.props}
                        submit={this._submit}
                    />
                )
            }

            /**
             * Shortcut to simplify using of `handleSubmit`.
             *
             * @example
             *
             * // Usually, when you have some special submitting logic
             * // you are doing this
             * const submit = this.props.handleSubmit(() => {
             *     // some submitting logic
             * })
             *
             * submit()
             *
             * // But now you can do this
             * this.props.submit(() => {
             *     // some submitting logic
             * })
             *
             * @param {Function} callback Will be passed to the `handleSubmit`
             * @private
             */
            _submit = (callback) => {
                if (!shouldSubmit || shouldSubmit(this.props)) {
                    const submit = this.props.handleSubmit(callback)
                    submit()
                }
            }

            /**
             * If the `onFieldSubmit` parameter was defined,
             * then this callback will be passed as the `submit`
             * property to every field.
             *
             * @private
             */
            _onFieldSubmit = () => {
                // We delay the submitting, because the `change`
                // action is dispatched after this function,
                // and `values` in the state is not actual.
                _.delay(() => {
                    this._submit(() => onFieldSubmit(this.props))
                })
            }
        }

        return FormWrapper
    }
}

/**
 * Returns a new version of `connectForm` binded to
 * the given args.
 *
 * @example
 *
 * // form.js
 *
 * import connectForm from 'Packages/ReduxForm/connectForm'
 *
 * export default connectForm.make({
 *     form: 'my-form',
 * })
 *
 * // Component.js
 *
 * import form from './form'
 *
 * \@form()
 * class Component extends React.Component {
 *     // ...
 * }
 *
 *
 * @returns {Function}
 */
connectForm.make = (...args) => {
    return () => {
        return connectForm(...args)
    }
}

const _populateParams = (componentName, reduxFormParams, params) => {
    const { validate } = reduxFormParams
    const { rules, names } = params

    if (validate && rules) {
        throw new Error(
            "You've defined `rules` and `validate` at the same time " +
            `in the "${componentName}" component. Choose something one.`
        )
    }

    if (names && ! rules) {
        throw new Error(
            "You've defined `names`, but not defined the `rules` " +
            `in the "${componentName}" component.`
        )
    }


    if (rules) {
        return {
            ...reduxFormParams,
            validate: Validator.make({ rules, names }),
        }
    }

    return reduxFormParams
}

export default connectForm