module.exports = {
  "*.{js,jsx,ts,tsx,json,jsonc}": [
    "biome check --write --no-errors-on-unmatched",
  ],
  "apps/web/**/*.{js,jsx,ts,tsx}": [
    "pnpm --filter @blobs-guru/web exec eslint --fix",
    "pnpm --filter @blobs-guru/web exec eslint",
  ],
  "apps/web/**/*.ts?(x)": () => "pnpm --filter @blobs-guru/web check-types",
};
