import Validator from 'Packages/Validation/Validator'


describe('Packages/Validation/Validator', function() {
    describe('#make', function() {
        it('must return a function', function() {
            const validate = Validator.make({ rules: {} })
            expect(validate).to.be.a('function')
        })

        it('the function must return errors', function() {
            const validate = Validator.make({ rules: { foo: 'required' }})
            const errors = validate({})
            expect(errors.foo).to.be.a('array')
        })

        it('the function must support names', function() {
            const validate = Validator.make({
                rules: { title: 'required' },
                names: { title: 'Заголовок' },
            })

            const errors = validate({})
            expect(errors.title[0]).to.match(/Заголовок/)
        })
    })
})