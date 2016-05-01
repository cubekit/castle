import React from 'react'
import PropTypes from 'Packages/React/PropTypes'


describe('Packages/React/PropTypes', function() {

    describe('#equals', function() {
        it('must throw if the passed value is incorrect', function() {
            const props = { name: 'John' }
            const propName = 'name'
            const validator = PropTypes.equals('Britney')
            const result = validator(props, propName)
            expect(result).to.be.an('Error')
        })

        it('must NOT throw if the passed value is correct', function() {
            const props = { name: 'Britney' }
            const propName = 'name'
            const validator = PropTypes.equals('Britney')
            const result = validator(props, propName)
            expect(result).to.not.be.an('Error')
        })

        describe('working with #oneOfType', function() {
            it('must throw if the same object does not exist', function() {
                const person = { name: 'John' }
                const propName = 'person'
                const validator = PropTypes.oneOfType([
                    PropTypes.equals({ name: 'Sasha' }),
                    PropTypes.equals({ name: 'Brittney' }),
                ]).isRequired

                const result = validator({ person: 2 }, propName, '', '')
                expect(result).to.be.an('Error')
            })

            it('must NOT throw if the same object exists', function() {
                const person = { name: 'Brittney' }
                const propName = 'person'
                const validator = PropTypes.oneOfType([
                    PropTypes.equals({ name: 'Sasha' }),
                    PropTypes.equals({ name: 'Brittney' }),
                ]).isRequired

                const result = validator({ person: 2 }, propName, '', '')
                expect(result).to.be.an('Error')
            })
        })
    })
})