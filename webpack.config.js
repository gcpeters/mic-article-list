module.exports = {
    entry: './index.jsx',

    output: {
        filename: 'main.js',
        publicPath: 'http://localhost:8090/build'
    },

    module: {
        loaders: [
            {
                test: /\.jsx$/,
                loader: 'jsx-loader?insertPragma=React.DOM&harmony'
            },
            {
                test: /\.scss$/,
                loader: 'style!css!sass'
              }
        ]
    },

    externals: {
        'react': 'React'
    },

    resolve: {
        extensions: ['', '.js', '.jsx']
    }
};