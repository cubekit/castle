import _ from 'lodash'
import meta from '../../../meta'


/**
 * It's a helper class for easy making multiple classes at once.
 */
@meta.singleton()
export default class Maker {

    /**
     * @example
     * const instances = maker.make(ioc, [Api, Config])
     * console.log(instances.api instanceof Api) // true
     * console.log(instances.config instanceof Config) // true
     *
     * @param {Container} ioc
     * @param {Array|Object} types
     */
    make(ioc, types) {
        return _.mapValues(this._normalizeTypes(types), t => ioc.make(t))
    }

    /**
     * @param {Array|Object} types
     * @returns {Object}
     * @private
     */
    _normalizeTypes(types) {
        if (_.isArray(types)) {
            return _.transform(types, (hash, type) => {
                hash[_.camelCase(type.name)] = type
            }, {})
        }

        return types
    }
}