const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// Если в package.json не задан мод, мод автоматически переключается на разработку
const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";

// HMR fix
const target = process.env.NODE_ENV === "production" ? "browserslist" : "web";

const pages = [
  // {
  //   filename: "page-name",
  //   chunkname: "pagename",
  // },
];

const fileName = (ext) =>
  mode === "development" ? `[name].${ext}` : `[name].[contenthash].${ext}`;

module.exports = {
  mode: mode,
  target: target,

  plugins: [
    new MiniCssExtractPlugin({
      filename: `css/${fileName("css")}`,
    }),
    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "src/index.html"),
      filename: `index.html`,
      chunks: ["index", "vendors", "runtime"],
    }),

    ...pages.map((page) => {
      return new HtmlWebpackPlugin({
        template: `./src/templates/${page.filename}.html`,
        filename: `templates/${page.filename}.html`,
        chunks: [`${page.chunkname}`],
      });
    }),
  ],

  entry: {
    index: "./src/js/index.js",
  },

  output: {
    filename: `js/${fileName("js")}`,
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    assetModuleFilename: (pathData) => {
      const filepath = path
        .dirname(pathData.filename)
        .split("/")
        .slice(1)
        .join("/");
      return `${filepath}/[name][ext][query]`;
    },
  },

  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "/" },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(svg|png|jpg|jpeg|webp|gif)$/i,
        type: "asset/resource",
      },
    ],
  },

  resolve: {
    extensions: [".js"],
  },

  devtool: mode === "production" ? false : "source-map",

  devServer: {
    port: 8080,
    client: {
      overlay: true,
    },
    static: {
      directory: path.join(__dirname, "dist"),
    },
    watchFiles: ["src/**/*.html"],
    hot: true,
  },

  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
    },
  },
};
