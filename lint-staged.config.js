module.exports = {
  "apps/web/**/*.{js,jsx,ts,tsx}": [
    "pnpm --filter @blobs-guru/web exec eslint --fix",
    "pnpm --filter @blobs-guru/web exec eslint",
  ],
  "apps/web/**/*.ts?(x)": () => "pnpm --filter @blobs-guru/web check-types",
  "**/*.json": ["prettier --write"],
};
