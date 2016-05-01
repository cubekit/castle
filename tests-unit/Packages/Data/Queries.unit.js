import Queries from 'Packages/Data/Queries'


describe('Packages/Data/Queries', function() {

    beforeEach(function() {
        this.create = function(Queries) {
            this.queries = new Queries
        }
    })

    describe('query-methods', function() {

        beforeEach(function() {
            this.create(
                class DumbQueries extends Queries {
                    dumbQuery = sinon.stub()
                }
            )

            this.queries.setActions({
                dumb: (params, { query }) => query(),
            })
        })

        it('must automatically add the `fetchQuery` method if it exists', function() {
            this.queries.runAction('dumb')
            const { dumbQuery } = this.queries
            expect(dumbQuery.callCount).to.equal(1)
        })

        it('must pass all the given args to the `fetchQuery` as is', function() {
            this.queries.runAction('dumb', { foo: 'bar' }, 1, 'foo')
            const { dumbQuery } = this.queries
            expect(dumbQuery.calledWith({ foo: 'bar' }, 1, 'foo')).to.be.ok
        })

        it('must not override `query` from arguments', function() {
            const argQuery = sinon.spy()
            this.queries.runAction('dumb', {}, { query: argQuery })
            const { dumbQuery } = this.queries

            expect({
                dumbQueryCalls: dumbQuery.callCount,
                argQueryCalls: argQuery.callCount,
            }).to.eql({
                dumbQueryCalls: 0,
                argQueryCalls: 1,
            })
        })
    })
})