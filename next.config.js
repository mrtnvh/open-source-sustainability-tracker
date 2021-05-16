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
};

module.exports = withPWA(config);
