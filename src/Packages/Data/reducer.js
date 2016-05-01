import _ from 'lodash'
import update from 'react-addons-update'
import React from 'react'


export const dataShape = {
    vars: React.PropTypes.object,
    errors: React.PropTypes.array,
    content: React.PropTypes.array,
    loading: React.PropTypes.bool.isRequired,
    version: React.PropTypes.number.isRequired,
}

function dataReducer(state = {
    vars: null,
    errors: null,
    content: null,
    loading: false,
    version: 1,
}, action) {

    switch(action.type) {
        case '@data/FETCH_START':
            return update(state, {
                // We must update vars on FETCH_START to
                // prevent widgets from infinite reloading
                vars: { $set: action.payload.vars },
                errors: { $set: null },
                loading: { $set: true },
            })

        case '@data/FETCH_SUCCESS':
            return update(state, {
                vars: { $set: action.payload.vars },
                loading: { $set: false },
                content: { $set: action.payload.content },
                version: { $set: state.version + 1 },
            })

        case '@data/FETCH_FAIL':
            return update(state, {
                loading: { $set: false },
                errors: { $set: action.payload.errors },
            })

        case '@data/CLEAR':
            return update(state, {
                vars: { $set: action.payload.vars },
                content: { $set: null },
            })

        case '@data/STORE':
            return update(state, {
                content: { $push: [action.payload.data] },
                version: { $set: state.version + 1 },
            })

        case '@data/UPDATE':
            return update(state, {
                content: {
                    $set: _.map(state.content, (data) => {
                        const idToUpdate = action.payload.id
                        const newValues = action.payload.data
                        return (data.id == idToUpdate)
                            ? { ...data, ...newValues }
                            : data
                    })
                },
                version: { $set: state.version + 1 },
            })

        case '@data/REMOVE':
            return update(state, {
                content: {
                    $set: _.filter(state.content, (data) => {
                        return (data.id != action.payload.id)
                    })
                },
                version: { $set: state.version + 1 },
            })

        default:
            return state
    }
}

export default function dataIndexReducer(state = {
    queries: {},
}, action) {

    if (_.startsWith(action.type, '@data')) {
        const { queries } = state
        const { name } = action
        const [prefix] = name.split('@')

        let nextQueries = _syncName(queries, name)

        if (action.type == '@data/UPDATE') {
            const keys = _.keys(queries)
            const sync = _.filter(keys, (key) => {
                return (key != name) && _.startsWith(key, `${prefix}@`)
            })

            nextQueries = _.reduce(sync, _syncName, nextQueries)
        }

        if (nextQueries != queries) {
            return { ...state, queries: nextQueries }
        }

        function _syncName(queries, name) {
            const prevQuery = queries[name]
            const nextQuery = dataReducer(prevQuery, action)

            if (nextQuery != prevQuery) {
                return { ...queries, [name]: nextQuery }
            }

            return queries
        }
    }

    return state
}