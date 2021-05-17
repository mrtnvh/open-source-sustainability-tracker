const withPWA = require("next-pwa");
const runtimeCaching = require("./config/runtimeCaching");

const config = {
  future: {
    webpack5: true,
  },
  pwa: {
    disable: process.env.NODE_ENV === "development",
    dest: "public",
    runtimeCaching,
  },
  webpack: (config, { isServer, dev }) => {
    config.output.chunkFilename = isServer
      ? `${dev ? "[name]" : "[name].[fullhash]"}.js`
      : `static/chunks/${dev ? "[name]" : "[name].[fullhash]"}.js`;

    return config;
  },
};

module.exports = withPWA(config);
