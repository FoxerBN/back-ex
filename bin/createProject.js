#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

import { FOLDERS } from "./consts/folders.js";
import {
  BASE_DEPENDENCIES,
  BASE_DEV_DEPENDENCIES,
  TS_DEPENDENCIES,
  TS_DEV_DEPENDENCIES,
  DB_DEPENDENCIES,
  CLOUDINARY_DEPENDENCY,
} from "./consts/dependencies.js";
import {
  ESLINT_CONFIG_TS,
  ESLINT_CONFIG_JS,
  TSCONFIG,
} from "./consts/eslintConfigs.js";
import {
  dbFileTemplate,
  cloudinaryFileTemplate,
  validateBodyTemplate,
  notFoundTemplate,
  errorHandlerTemplate,
  appTemplate,
  indexTemplate,
  messageResponseTemplate,
  errorResponseTemplate,
} from "./consts/templates.js";

/**
 * @param {string} projectName
 * @param {boolean} useTypescript
 * @param {string} dbChoice
 * @param {boolean} useCloudinary
 */
export function createProject(
  projectName,
  useTypescript,
  dbChoice,
  useCloudinary
) {
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`❌ Projekt "${projectName}" už existuje!`));
    process.exit(1);
  }

  console.log(chalk.green(`🚀 Vytváram projekt: ${projectName}...`));
  // 1. Create folders
  FOLDERS.forEach((folder) => fs.mkdirpSync(path.join(projectPath, folder)));

  // 2. Dependencies
  let dependencies = { ...BASE_DEPENDENCIES };
  let devDependencies = { ...BASE_DEV_DEPENDENCIES };
  let envExtras = "";

  // DB
  if (dbChoice === "mongo") {
    Object.assign(dependencies, DB_DEPENDENCIES.mongo);
    envExtras += "MONGODB_URI=<your mongodb uri here>\n";
  }
  // Cloudinary
  if (useCloudinary) {
    Object.assign(dependencies, CLOUDINARY_DEPENDENCY);
    envExtras += "CLOUD_NAME=\nCLOUD_API_KEY=\nCLOUD_API_SECRET=\n";
  }

  // TypeScript
  if (useTypescript) {
    Object.assign(devDependencies, TS_DEV_DEPENDENCIES);
    Object.assign(dependencies, TS_DEPENDENCIES);
  }

  // 3. package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "basic express api backend",
    main: useTypescript ? "src/index.ts" : "src/index.js",
    scripts: useTypescript
      ? {
          start: "ts-node src/index.ts",
          dev: "nodemon src/index.ts",
          build: "tsc",
          "start:dist": "node dist/src/index.js",
          typecheck: "tsc --noEmit",
        }
      : {
          dev: "nodemon src/index.js",
          start: "node src/index.js",
        },
    keywords: [],
    author: "Richard Tekula",
    license: "MIT",
    dependencies,
    devDependencies,
    ...(useTypescript ? {} : { type: "module" }),
  };
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // 4. .env
  const envContent = `PORT=5000
NODE_ENV=development
${envExtras}`;
  fs.writeFileSync(path.join(projectPath, ".env"), envContent);

  // 5. ESLint & TSConfig
  fs.writeFileSync(
    path.join(projectPath, ".eslintrc.json"),
    JSON.stringify(
      useTypescript ? ESLINT_CONFIG_TS : ESLINT_CONFIG_JS,
      null,
      2
    )
  );
  if (useTypescript) {
    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(TSCONFIG, null, 2)
    );
  }

  // 6. DB file
  if (dbChoice === "mongo") {
    const ext = useTypescript ? "ts" : "js";
    fs.writeFileSync(
      path.join(projectPath, "src", "config", `db.${ext}`),
      dbFileTemplate(useTypescript)
    );
  }

  // 7. Cloudinary file
  if (useCloudinary) {
    const ext = useTypescript ? "ts" : "js";
    fs.writeFileSync(
      path.join(projectPath, "src", "config", `cloudinary.${ext}`),
      cloudinaryFileTemplate(useTypescript)
    );
  }

  // 8. Security middleware
  const validateBodyPath = path.join(
    projectPath,
    "src",
    "middlewares",
    "global",
    `validateBody.${useTypescript ? "ts" : "js"}`
  );
  fs.writeFileSync(validateBodyPath, validateBodyTemplate(useTypescript));

  // 9. notFound, errorHandler, interface files
  fs.writeFileSync(
    path.join(
      projectPath,
      "src",
      "middlewares",
      "global",
      `notFound.${useTypescript ? "ts" : "js"}`
    ),
    notFoundTemplate(useTypescript)
  );
  fs.writeFileSync(
    path.join(
      projectPath,
      "src",
      "middlewares",
      "global",
      `errorHandler.${useTypescript ? "ts" : "js"}`
    ),
    errorHandlerTemplate(useTypescript)
  );

  // 10. main app/index
  fs.writeFileSync(
    path.join(projectPath, "src", `app.${useTypescript ? "ts" : "js"}`),
    appTemplate(useTypescript, dbChoice)
  );
  fs.writeFileSync(
    path.join(projectPath, "src", `index.${useTypescript ? "ts" : "js"}`),
    indexTemplate(useTypescript)
  );

  // 11. interfaces for TS
  if (useTypescript) {
    fs.mkdirpSync(path.join(projectPath, "src", "interfaces"));
    fs.writeFileSync(
      path.join(projectPath, "src", "interfaces", "MessageResponse.ts"),
      messageResponseTemplate
    );
    fs.writeFileSync(
      path.join(projectPath, "src", "interfaces", "ErrorResponse.ts"),
      errorResponseTemplate
    );
  }

  // 12. Final logs
  const lightBlue = chalk.hex("#ADD8E6");
  console.log(chalk.green("✅ Projekt bol úspešne vytvorený!"));
  console.log(lightBlue(`📂  cd ${projectName}`));
  console.log(lightBlue("📦  npm install"));
  console.log(lightBlue("🚀  npm run dev"));
  console.log();
  console.log(
    chalk.yellow(
      "Tip: In TypeScript (compiled to CommonJS), TS resolves imports without extensions automatically.\n" +
        "In pure JavaScript ESM ('type: module'), Node requires explicit '.js' file extensions in imports."
    )
  );
}