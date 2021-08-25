import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      paths[`js/iamc/${name}`] = `./src/entry_points/iamc/${name}.js`;
      paths[
        `js/pipeline-profiles/${name}`
      ] = `./src/entry_points/pipeline-profiles/${name}.js`;
    });
    return paths;
  }

  function outputHtml() {
    const html = [];
    filenames.forEach((name) => {
      const htmls = [
        new HtmlWebpackPlugin({
          filename: `html/${name}.html`,
          template: "src/components/iamc.html",
          chunks: [`js/iamc/${name}`],
          minify: { collapseWhitespace: true },
        }),
        new HtmlWebpackPlugin({
          filename: `html/pipeline-profiles/${name}.html`,
          template: "src/components/pipeline-profiles.html",
          chunks: [`js/pipeline-profiles/${name}`],
          minify: { collapseWhitespace: true },
        }),
      ];
      html.push(...htmls);
    });
    return html;
  }

  return {
    entryJs,
    outputHtml,
  };
})();

export default {
  entry: webpackOutputs.entryJs(),
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].[contenthash].js",
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
          from: path.resolve(__dirname, "src", "index.html"),
          to: path.resolve(__dirname, "dist", "index.html"),
        },
        {
          from: path.resolve(
            __dirname,
            "src",
            "traditional_territory",
            "images"
          ),
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
        sideEffects: true,
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader", options: { url: false } },
        ],
        sideEffects: true,
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

  optimization: {
    minimize: true,
    usedExports: true,
    runtimeChunk: {
      name: "shared/runtime.js",
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        defaultVendors: {
          enforce: true,
          test: /node_modules/,
          filename: "js/vendor/vendor.[contenthash].js",
          reuseExistingChunk: true,
        },
      },
    },
  },
};
