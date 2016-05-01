import chaiEnzyme from 'chai-enzyme'
import chaiSinon from 'sinon-chai'
const __karmaWebpackManifest__ = [] // eslint-disable-line
const inManifest = (path) => ~__karmaWebpackManifest__.indexOf(path)

chai.use(chaiEnzyme())
chai.use(chaiSinon)
chai.config.truncateThreshold = 0

// require all `tests/**/*.unit.js`
const testsContext = require.context('./', true, /\.unit\.js$/)

// only run tests that have changed after the first pass.
const testsToRun = testsContext.keys().filter(inManifest)
    ;(testsToRun.length ? testsToRun : testsContext.keys()).forEach(testsContext)