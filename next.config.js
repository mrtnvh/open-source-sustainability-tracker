const withPWA = require("next-pwa");
const runtimeCaching = require("./config/runtimeCaching");

const config = {
  pwa: {
    dest: "public",
    runtimeCaching,
  },
};
module.exports = withPWA(config);
