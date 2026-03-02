const fs = require("fs");
const path = require("path");

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      filelist.push(filePath);
    }
  }
  return filelist;
};

const appPath = path.join(process.cwd(), "src", "app", "(appRoutes)");
const dynamicRoutes = walkSync(appPath).filter(
  (f) => f.includes("[") && f.endsWith("page.tsx"),
);

dynamicRoutes.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Find imports like: import SingleAccount from "@/views/Accounts/SingleAccount";
  const importRegex =
    /import\s+([A-Za-z0-9_]+)\s+from\s+["'](@\/views\/[^"']+)["'];?/g;

  let match;
  let matches = [];
  while ((match = importRegex.exec(content)) !== null) {
    matches.push({ full: match[0], name: match[1], path: match[2] });
  }

  if (matches.length > 0) {
    let newContent = content;

    matches.forEach((m) => {
      const dynamicImport = `const ${m.name} = dynamic(() => import("${m.path}"));`;
      // Sometimes they might need { ssr: false }, let's keep it simple first
      newContent = newContent.replace(m.full, dynamicImport);
    });

    if (!newContent.includes("next/dynamic")) {
      // Insert after use client if it exists, or just after export const runtime = 'edge';
      const importDynamic = `import dynamic from "next/dynamic";\n`;
      if (newContent.includes('"use client";')) {
        newContent = newContent.replace(
          '"use client";',
          '"use client";\n' + importDynamic,
        );
      } else if (newContent.includes("export const runtime = 'edge';")) {
        newContent = newContent.replace(
          "export const runtime = 'edge';",
          "export const runtime = 'edge';\n" + importDynamic,
        );
      } else {
        newContent = importDynamic + newContent;
      }
    }

    fs.writeFileSync(file, newContent, "utf8");
    console.log("Updated " + file);
  }
});
