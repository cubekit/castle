import { Promise as PromiseBase } from 'es6-promise'


export default class Promise extends PromiseBase {

    /**
     * @param {*} [value]
     * @param {number} [ms]
     * @returns {Promise}
     */
    static timeout(value = null, ms = 500) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(value), ms)
        })
    }
}