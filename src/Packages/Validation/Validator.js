import Validator from 'validatorjs'
import 'validatorjs/src/lang/ru'


/**
 * Check this URL for the available rules description:
 * {@link https://github.com/skaterdav85/validatorjs#available-rules}
 */

Validator.useLang('ru')

Validator.make = ({ rules, names }) => {
    return (data) => {
        const validator = new Validator(data, rules)

        if (names) {
            validator.setAttributeNames(names)
        }

        if (validator.fails()) {
            return validator.errors.all()
        }

        return {}
    }
}

export default Validator