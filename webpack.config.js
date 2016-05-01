'use strict';
var path = require('path')
var rimraf = require('rimraf')
var webpack = require('webpack')
var argv = require('yargs').argv;
var ExtractTextPlugin = require('extract-text-webpack-plugin');


process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();
process.env.NODE_ENV = argv.production ? 'production' : process.env.NODE_ENV;
var __DEV__ = process.env.NODE_ENV == 'development';
var __SOURCEMAP__ = !!argv.sourcemap;
var __WATCH__ = !!argv.watch;

var webpackConfig = {
    entry: {
        demo: 'src/demo.js',

        vendor: [
            'lodash',
            'react',
            'moment',
            'react-router',
            'redux',
            'react-redux',
            'redux-thunk',
            'redux-form',
            'redux-modal',
            'cubekit-ioc',
            'cubekit-meta',
            'classnames',
            'validatorjs',
            'validatorjs/src/lang/ru',
        ]
    },

    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: '/js/[name].bundle.js',
    },

    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    optional: [
                        'es7.classProperties',
                        'es7.decorators',
                        'spec.protoToAssign'
                    ],
                    loose: ['es6.classes', 'es6.modules'],
                    stage: 0
                }
            },
            {
                test: /\.json/,
                loader: 'json-loader',
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract('style','css!autoprefixer?{browsers:["last 10 version", "> 5%"]}!stylus?resolve url')
            },
            {
                // src/fonts
                test: /\.(png|jpg|gif|svg|ttf|eot|otf|woff|woff2)$/,
                loader: 'file?name=files/[name].[hash:6].[ext]'
            }
        ]
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin('vendor', '/js/vendor.bundle.js'),
        new ExtractTextPlugin('/css/[name].css'),
    ],

    resolve: {
        extensions: ['', '.js', '.styl', '.sass', '.scss', '.json'],
        modulesDirectories: ['src', 'node_modules'],
        alias : {
            img : path.resolve(__dirname, 'src/img'),
            stylus : path.resolve(__dirname, 'src/stylus'),
        }
    },

    devtool: __SOURCEMAP__ ? 'cheap-module-source-map' : false
}

if (!!argv.notifier) {
    var WebpackBuildNotifierPlugin = require('webpack-build-notifier');

    webpackConfig.plugins.push(
        new WebpackBuildNotifierPlugin({
            sound: false,
        })
    )
}

module.exports = webpackConfig