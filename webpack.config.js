const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

const webpackOutputs = (function () {
  const filenames = [
    "ngtl",
    "trans_mountain",
    "alliance",
    "norman_wells",
    "enbridge_mainline",
    "keystone",
    "tcpl",
    "trans_northern",
    "westcoast",
  ];

  function entryJs() {
    const paths = {};
    filenames.forEach((name) => {
      paths[name] = `./src/entry_points/${name}.js`;
    });
    return paths;
  }

  function outputHtml() {
    const html = filenames.map((name) => {
      return new HtmlWebpackPlugin({
        filename: `${name}.html`,
        template: "src/template.html",
        chunks: [`${name}`],
        minify: { collapseWhitespace: false },
      });
    });
    return html;
  }

  return {
    entryJs: entryJs,
    outputHtml: outputHtml,
  };
})();

module.exports = {
  // mode: "development",
  mode: "production",
  entry: webpackOutputs.entryJs(),
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "js/[name].js",
  },

  plugins: [
    ...webpackOutputs.outputHtml(),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "main.css"),
          to: path.resolve(__dirname, "dist", "main.css"),
        },
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
        {
          from: path.resolve(__dirname, "src", "wet-boew"),
          to: path.resolve(__dirname, "dist", "wet-boew"),
        },
      ],
    }),
    new CleanWebpackPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        use: {
          loader: "file-loader",
          options: {
            publicPath: "dist/images/",
            outputPath: "images",
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ["*", ".js"],
  },

  devServer: {
    // publicPath: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    watchContentBase: true,
    compress: true,
  },

  // optimization: {
  //   minimize: true,
  // },

  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        defaultVendors: {
          enforce: true,
          test: /[\\/]node_modules[\\/]/,
          filename: "js/[name].vendor.js",
          reuseExistingChunk: true,
        },
      },
    },
  },
};
