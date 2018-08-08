const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        dp_note: './src/main_dp_note.js',
        lp_thebrain: './src/main_lp_thebrain.js',
        myinfo: './src/main_myinfo.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './src/template.myinfo.html',
            title: 'myInfo PROD PAGE - mindmap, thebrain',
            filename: 'index.html',
            excludeChunks: [ 'dp_note', 'lp_thebrain' ]
        })
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    }/*,
    module: {
        rules: [
            {
                type: 'javascript/auto',
                test: /\.(json)$/,
                use: [
                    'file-loader?name=[name].[ext]'
                ]
            }
        ]
    }
*/
};
