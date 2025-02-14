module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: [
                    {
                        loader: "coverage-istanbul-loader",
                        options: { esModules: true },
                    },
                ],
                enforce: "post",
                include: require("path").join(__dirname, "..", "modules"),
                exclude: [
                    /\.(e2e|spec|po)\.ts$/,
                    /node_modules/,
                    /(ngfactory|ngstyle)\.js/,
                ],
            },
        ],
    },
};
