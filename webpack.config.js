const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");

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
    const html = filenames.map(
      (name) =>
        new HtmlWebpackPlugin({
          filename: `${name}.html`,
          template: "src/template.html",
          chunks: [`${name}`],
          minify: { collapseWhitespace: true },
        })
    );
    return html;
  }

  return {
    entryJs,
    outputHtml,
  };
})();

module.exports = {
  // mode: "development",
  mode: "production",
  entry: webpackOutputs.entryJs(),
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "js/[name].[contenthash].js",
  },

  plugins: [
    ...webpackOutputs.outputHtml(),
    // new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
        {
          from: path.resolve(__dirname, "src", "wet-boew"),
          to: path.resolve(__dirname, "dist", "wet-boew"),
        },
        {
          from: path.resolve(__dirname, "src", "traditional_territory", "images"),
          to: path.resolve(__dirname, "dist", "images"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "main.[contenthash].css",
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
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.png$/,
        use: {
          loader: "file-loader",
          options: {
            publicPath: "dist/images/",
            outputPath: "images",
            name: "[name].[contenthash].png",
          },
        },
        type: "javascript/auto",
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

  optimization: {
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()],
    usedExports: true,
    // runtimeChunk: true,
    runtimeChunk: {
      name: "shared/runtime.js",
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        defaultVendors: {
          enforce: true,
          test: /node_modules/,
          filename: "js/shared/vendor.[contenthash].js",
          reuseExistingChunk: true,
        },
      },
    },
  },
};
