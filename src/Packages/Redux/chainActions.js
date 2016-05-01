import { Promise } from 'es6-promise'


/**
 * This function accepts an array of actions and generate
 * a new action, which will call the given actions
 * one by one. If some action will return a promise,
 * then it will be waited before call the next action.
 *
 * @param {Array<Function>} actionCreators
 */
export default function chainActions(actionCreators) {
    return (dispatch) => {
        const callNext = (prevResult) => {
            const next = actionCreators.shift()
            const action = next(prevResult)

            if (!_.isUndefined(action)) {
                return Promise.resolve(dispatch(action))
            }
        }

        const runPipe = (resolve, prevResult) => {
            if (actionCreators.length > 0) {
                const promise = callNext(prevResult)

                if (!promise) {
                    return resolve()
                }

                promise.then((result) => {
                    runPipe(resolve, result)
                })
            } else {
                resolve()
            }
        }

        return new Promise((r) => runPipe(r, null))
    }
}