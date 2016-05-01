import _ from 'lodash'
import React from 'react'
import connectForm from 'Packages/ReduxForm/connectForm'
import { mount } from 'enzyme'


describe('Packages/ReduxForm/connectForm', function() {

    beforeEach(function() {
        this.DumbComponent = class extends React.Component {}
    })

    describe('#validation', function() {
        it('must throw if `validate` and `rules` was passed at the same time', function() {
            const mustThrow = () => {
                connectForm({ validate: _.noop }, { rules: {} })(this.DumbComponent)
            }

            expect(mustThrow).to.throw(/Choose something one/)
        })

        it('must throw if `names` define without `rules`', function() {
            const mustThrow = () => {
                connectForm({}, {
                    names: { title: 'Заголовок' },
                })(this.DumbComponent)
            }

            expect(mustThrow).to.throw(/but not defined/)
        })
    })

    describe('tests for the result props', function() {

        /**
         * It's an empty decorator to the replace the original
         * `reduxForm` decorator during testing.
         */
        const connectReduxForm = () => () => {}

        /**
         * Generates a dumb form component, decorated with the
         * function which we are testing. Renders it after
         * generation, using `enzyme`, and extracts the resulting
         * props given to the dumb form.
         *
         * In the other words this function allows us to test
         * the `props` which real forms will receive from the
         * tested decorator.
         *
         * You can also define `options.props` which will be used
         * during rendering the dumb form, and `options.params`
         * which is passed to the decorator as the second argument.
         *
         * @param options
         * @returns {Object}
         */
        const getResultProps = (options = {}) => {
            let resultProps = null

            @connectForm({}, {
                connectReduxForm,
                ...options.params,
            })
            class TestForm {
                render() {
                    // I have no idea how to extract this
                    // props without a closure
                    resultProps = this.props
                    return null
                }
            }

            mount(
                <TestForm
                    fields={{ someField: {} }}
                    submitting={false}
                    {...options.props}
                />
            )

            return resultProps
        }

        it('must add `name` to the field objects', function() {
            const { fields } = getResultProps()
            expect(fields.someField.name).to.equal('someField')
        })

        it('must add `disabled=true` to the field object if form is in submitting', function() {
            const { fields } = getResultProps({
                props: { submitting: true },
            })

            expect(fields.someField.disabled).to.be.ok
        })

        it('must NOT add `disabled=true` to the field object if form ' +
            'is in submitting but `disableFieldsOnSubmit` is false', function() {

            const { fields } = getResultProps({
                params: { disableFieldsOnSubmit: false },
                props: { submitting: true },
            })

            expect(fields.someField.disabled).to.not.be.ok
        })

        it('must NOT submit if `shouldSubmit` returns false', function() {
            const handleSubmit = sinon.stub().returns(() => {})
            const props = getResultProps({
                params: { shouldSubmit: () => false },
                props: { handleSubmit },
            })

            props.submit()
            expect(handleSubmit).to.have.been.not.called
        })
    })
})