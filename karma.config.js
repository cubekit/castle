var webpack = require('webpack')
var webpackConfig = require('./webpack.config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')


module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai', 'sinon'],
        files: [
            './node_modules/phantomjs-polyfill/bind-polyfill.js',
            {
                pattern: `./tests-unit/test-bundler.js`,
                watched: false,
                served: true,
                included: true
            }
        ],
        plugins: [
            'karma-webpack',
            'karma-mocha',
            'karma-chai',
            'karma-sinon',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
        ],
        browsers: ['Chrome'],
        preprocessors: {
            'src/**/*.js': ['webpack'],
            'tests-unit/**/*.js': ['webpack'],
        },
        webpack: {
            module: webpackConfig.module,
            resolve: webpackConfig.resolve,

            plugins: [
                new ExtractTextPlugin('/css/[name].css'),
            ],
        },
        webpackMiddleware: { noInfo: true }
    })
}
