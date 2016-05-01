import reducer from 'Packages/Data/reducer'


describe('Packages/Data/reducer', function() {

    describe('queries', function() {
        it('must add data to the state on FETCH_SUCCESS', function() {
            const result = reducer(undefined, {
                type: '@data/FETCH_SUCCESS',
                name: 'users@main',
                payload: {
                    vars: {},
                    content: [
                        { id: 1, name: 'Sasha', active: true },
                    ]
                }
            })

            const { content } = result.queries['users@main']
            expect(content).to.eql([
                { id: 1, name: 'Sasha', active: true },
            ])
        })

        it('must update data in the state on UPDATE', function() {
            const result = reducer({
                queries: {
                    'users@main': {
                        content: [
                            { id: 1, name: 'Sasha', active: true }
                        ]
                    }
                }
            }, {
                type: '@data/UPDATE',
                name: 'users@main',
                payload: {
                    id: 1,
                    data: { active: false },
                }
            })

            const { content } = result.queries['users@main']
            expect(content).to.eql([
                { id: 1, name: 'Sasha', active: false },
            ])
        })

        it('must sync data with the same prefix on UPDATE', function() {
            const result = reducer({
                queries: {
                    'users@main': {
                        content: [
                            { id: 1, name: 'Sasha', active: true }
                        ]
                    },
                    'users@sidebar': {
                        content: [
                            { id: 1, name: 'Sasha', active: true }
                        ]
                    },
                }
            }, {
                type: '@data/UPDATE',
                name: 'users@main',
                payload: {
                    id: 1,
                    data: { active: false },
                }
            })

            const mainContent = result.queries['users@main'].content
            const sidebarContent = result.queries['users@sidebar'].content
            expect(mainContent[0]).to.eql(sidebarContent[0])
        })

        it('must NOT sync data on FETCH_SUCCESS', function() {
            const result = reducer({
                queries: {
                    'users@main': {
                        content: []
                    },
                    'users@sidebar': {
                        content: []
                    },
                }
            }, {
                type: '@data/FETCH_SUCCESS',
                name: 'users@main',
                payload: {
                    vars: {},
                    content: [
                        { id: 1, name: 'Sasha', active: true },
                    ]
                }
            })

            const sidebarContent = result.queries['users@sidebar'].content
            expect(sidebarContent).to.eql([])
        })
    })
})