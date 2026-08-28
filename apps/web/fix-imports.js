const fs = require("fs");
const path = require("path");

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const appRoutesPath = path.join(__dirname, "src/app/(appRoutes)");
const files = walkSync(appRoutesPath).filter(
  (file) => file.includes("[") && file.endsWith("/page.tsx"),
);

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  const importRegex =
    /import\s+(Single\w+)\s+from\s+["'](@\/views\/[^"']+)["'];?/g;

  let match;
  let matches = [];
  while ((match = importRegex.exec(content)) !== null) {
    matches.push(match);
  }

  if (matches.length > 0) {
    let newContent = content;

    matches.forEach((m) => {
      const fullMatch = m[0];
      const componentName = m[1];
      const importPath = m[2];

      const dynamicImport = `const ${componentName} = dynamic(() => import("${importPath}"), { ssr: false });`;

      newContent = newContent.replace(fullMatch, dynamicImport);
    });

    if (!newContent.includes("next/dynamic")) {
      if (newContent.includes('"use client";')) {
        newContent = newContent.replace(
          '"use client";',
          '"use client";\nimport dynamic from "next/dynamic";',
        );
      } else {
        newContent = `import dynamic from "next/dynamic";\n` + newContent;
      }
    }

    fs.writeFileSync(file, newContent, "utf8");
    console.log(`Updated ${file}`);
  }
});
