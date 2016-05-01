import Promise from 'Utils/Promise'
import chainActions from 'Packages/Redux/chainActions'


describe('Packages/Redux/chainActions', function() {
    it('must await the promise from the first action before call the next', function() {
        let resolvePromise = null
        const dispatch = (arg) => arg
        const promise = new Promise((r) => resolvePromise = r)

        const action1 = sinon.stub().returns(promise)
        const action2 = sinon.stub()
        const chained = chainActions([action1, action2])
        const result = chained(dispatch)

        // The second action must not be called before
        // the promise from the first action has resolved
        expect(action1.callCount).to.equal(1)
        expect(action2.callCount).to.equal(0)
        resolvePromise()

        return result.then(() => {
            expect(action2.callCount).to.equal(1)
        })
    })

    it('must push result of the previous action to the next', function() {
        let resolvePromise = null
        const dispatch = (arg) => arg
        const promise = new Promise((r) => resolvePromise = r)

        const action1 = sinon.stub().returns(promise)
        const action2 = sinon.stub()
        const chained = chainActions([action1, action2])
        const result = chained(dispatch)

        resolvePromise('promise-result')

        return result.then(() => {
            expect(action2.calledWith('promise-result')).to.be.ok
        })
    })

    describe('undefined action', function() {
        beforeEach(function() {
            this.dispatch = sinon.spy((arg) => arg)
            this.chained = chainActions([
                this.action1 = sinon.stub().returns({ type: 'action' }),
                this.action2 = sinon.stub().returns(undefined),
                this.action3 = sinon.stub(),
            ])
        })

        it('must break the chain if the action is undefined', function() {
            return this.chained(this.dispatch).then(() => {
                expect({
                    action1: this.action1.callCount,
                    action2: this.action2.callCount,
                    action3: this.action3.callCount,
                }).to.eql({
                    action1: 1,
                    action2: 1,
                    action3: 0,
                })
            })
        })

        it('must not dispatch the action if the action is undefined', function() {
            return this.chained(this.dispatch).then(() => {
                expect(this.dispatch.callCount).to.equal(1)
            })
        })
    })
})