import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "wasm",
  "insert_fx",
  "target",
  "wasm32-unknown-unknown",
  "release",
  "insert_fx.wasm",
);
const destDir = path.join(root, "public", "wasm");
const destPath = path.join(destDir, "insert_fx.wasm");

if (!fs.existsSync(sourcePath)) {
  console.error("WASM file not found:", sourcePath);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(sourcePath, destPath);
console.log("Copied WASM to", destPath);
