const fs = require("fs-extra");
const path = require("path");

const source = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const dest = path.join(__dirname, "..", "public", "cesium");

["Workers", "ThirdParty", "Assets", "Widgets"].forEach((folder) => {
  fs.copySync(path.join(source, folder), path.join(dest, folder));
});

console.log("Assets do Cesium copiados para public/cesium");