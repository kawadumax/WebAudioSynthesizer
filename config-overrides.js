const path = require("path");
const { override, addWebpackAlias } = require("customize-cra");

module.exports = override(
  addWebpackAlias({
    "@components": path.resolve(__dirname, "src/components/"),
    "@parts": path.resolve(__dirname, "src/components/parts"),
    "@controls": path.resolve(__dirname, "src/components/controls"),
    "@circuits": path.resolve(__dirname, "src/components/circuits"),
    "@utils": path.resolve(__dirname, "src/utils/"),
    "@styles": path.resolve(__dirname, "src/styles/"),
    "@assets": path.resolve(__dirname, "src/assets/"),
    "@": path.resolve(__dirname, "src/"),
  })
);
