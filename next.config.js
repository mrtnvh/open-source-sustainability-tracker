const withPWA = require("next-pwa");
const runtimeCaching = require("./config/runtimeCaching");

const config = {
  pwa: {
    disable: process.env.NODE_ENV === "development",
    dest: "public",
    runtimeCaching,
  },
};
module.exports = withPWA(config);
