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
        contentBase: path.resolve(__dirname, 'public')
    },
    plugins: [
        //new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './src/myinfo/view/template.myinfo.html',
            title: 'myInfo PROD PAGE - mindmap, thebrain',
			filename: 'index.html',
			inject: true,
            excludeChunks: [ 'dp_note', 'lp_thebrain' ]
        })
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public'),
        publicPath: '/'
	},
    module: {
        rules: [
            {
                test: /\.(def)$/,
                use: 'raw-loader'
            }
        ]
    }
};
