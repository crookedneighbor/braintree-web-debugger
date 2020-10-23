/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const fileSystem = require("fs-extra");
const env = require("./utils/env");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const BROWSER = env.BROWSER;
const PATH_TO_BROWSER_UTILS = path.resolve(__dirname, "build/browser-utils/");

// NOTE: whenever you add an alias here, you also need to add the
// corresponding alias to the paths field in the tsconfig
// TODO: should probably do that programatically
const alias = {
  Browser: PATH_TO_BROWSER_UTILS,
  Constants: path.resolve(__dirname, "src/js/resources/constants.ts"),
  Lib: path.resolve(__dirname, "src/js/lib/"),
};

fileSystem.mkdirp(PATH_TO_BROWSER_UTILS);
if (BROWSER === "GOOGLE_CHROME") {
  fileSystem.copySync(
    path.resolve(__dirname, "src/js/lib/chrome/"),
    PATH_TO_BROWSER_UTILS
  );
} else if (BROWSER === "FIREFOX") {
  fileSystem.copySync(
    path.resolve(__dirname, "src/js/lib/firefox/"),
    PATH_TO_BROWSER_UTILS
  );
}

const secretsPath = path.join(__dirname, "secrets." + env.NODE_ENV + ".js");

const fileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "eot",
  "otf",
  "svg",
  "ttf",
  "woff",
  "woff2",
];

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath;
}

const options = {
  context: process.cwd(),
  mode: env.NODE_ENV,
  optimization: {
    // extensions don't receive a performance boost by doing this
    // and Firefox requires extension code to be unminified
    minimize: false,
  },
  entry: {
    background: path.join(__dirname, "src", "js", "background", "index.ts"),
    main: path.join(__dirname, "src", "js", "main", "index.ts"),
    // embed: path.join(__dirname, "src", "js", "embed", "index.ts"),
    ["fake-braintree"]: path.join(
      __dirname,
      "src",
      "js",
      "fake-braintree",
      "index.ts"
    ),
  },
  output: {
    path: path.join(__dirname, "build", BROWSER.toLowerCase()),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
              hmr: process.env.NODE_ENV !== "production",
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader", options: { transpileOnly: true } }],
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"), // eslint-disable-line
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        enforce: "post",
        loader: "string-replace-loader",
        options: {
          search: 'new Function("return this")()',
          replace: "null",
        },
        test: /\.js$/,
      },
      {
        enforce: "post",
        loader: "string-replace-loader",
        options: {
          search: 'new Function("" + callback)',
          replace: "() => {}",
        },
        test: /\.js$/,
      },
    ],
  },
  resolve: {
    alias: alias,
    extensions: [".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        // TODO: if we generate the tsconfig programtically
        // for the path resolution, than enable this
        /*configFile: "./path/to/tsconfig.json" */
      }),
    ],
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["!*manifest.json"],
      cleanAfterEveryBuildPatterns: ["!*.html", "!*manifest.json"],
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: "./src/**/*.ts",
      },
    }),
    new ForkTsCheckerNotifierWebpackPlugin({
      title: "TypeScript",
      excludeWarnings: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          transform: function (content, path) {
            const json = {
              // generates the manifest file using the package.json informations
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              content_security_policy: "script-src 'self'; object-src 'self'",
              ...JSON.parse(content.toString()),
            };
            if (BROWSER === "FIREFOX") {
              json.browser_specific_settings = {
                gecko: {
                  id:
                    process.env.npm_package_name + "_blade@crookedneighbor.com",
                  strict_min_version: "69.0",
                },
              };
            }

            if (env.NODE_ENV !== "production") {
              // so the background script can hot-reload
              json.content_security_policy =
                "script-src 'self' 'unsafe-eval'; object-src 'self'";
            }

            return Buffer.from(JSON.stringify(json));
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "background.html",
      // TODO fill this in with your background title
      title: "Browser Background Page",
      chunks: ["background"],
    }),
    new MiniCssExtractPlugin(),
    new WriteFilePlugin(),
  ],
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
