const configurator = require("@nteract/webpack-configurator");
const withTM = require("next-transpile-modules");

module.exports = withTM(Object.keys(configurator.aliases))({
  webpack: (config, {
    isServer
  }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: "empty"
      };
    }
    const {
      module = {}
    } = config;
    config = {
      ...config,
      externals: ["canvas", ...(config.externals || [])],
      module: {
        ...module,
        rules: [
          ...(module.rules || []),
          {
            test: /\.(jpg|png|gif)$/,
            use: "file-loader"
          }
        ]
      }
    };

    return config;
  }
});
