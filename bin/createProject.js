#!/usr/bin/env node
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import inquirer from "inquirer";
import { fileURLToPath } from "url";

/**
 * Vytvorí projekt s Express API a voliteľným TS/JS + MongoDB.
 * Obsahuje aj middleware na kontrolu tela požiadavky.
 *
 * @param {string} projectName - Názov projektu
 * @param {boolean} useTypescript - True, ak je potrebná TypeScript verzia
 * @param {string} dbChoice - "none" | "mongo"
 */
export function createProject(projectName, useTypescript, dbChoice) {
  const projectPath = path.join(process.cwd(), projectName);

  // Check if folder already exists
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`❌ Projekt "${projectName}" už existuje!`));
    process.exit(1);
  }

  console.log(chalk.green(`🚀 Vytváram projekt: ${projectName}...`));

  // Create the folders
  const folders = [
    "src",
    "src/config",
    "src/controllers",
    "src/middlewares/global",
    "src/models",
    "src/routes",
    "src/utils",
  ];
  folders.forEach((folder) => fs.mkdirpSync(path.join(projectPath, folder)));

  // ******************************
  // DB dependencies & .env additions
  // ******************************
  let extraDependencies = {};
  let envExtras = "";
  if (dbChoice === "mongo") {
    // Mongoose + express-mongo-sanitize to guard against injection
    extraDependencies = {
      mongoose: "^7.3.2",
      "express-mongo-sanitize": "^2.2.0",
    };
    envExtras = "MONGODB_URI=<your mongodb uri here>\n";
  }

  // ********************
  // Shared dependencies
  // ********************
  let dependencies = {
    express: "^4.21.1",
    cors: "^2.8.5",
    dotenv: "^16.4.5",
    helmet: "^8.0.0",
    morgan: "^1.10.0",
    ...extraDependencies,
  };

  // Shared devDependencies
  let devDependencies = {
    nodemon: "^3.1.7",
    eslint: "latest",
  };

  // *******************
  // package.json config
  // *******************
  let packageJson;
  if (useTypescript) {
    // TypeScript variant
    packageJson = {
      name: projectName,
      version: "1.0.0",
      description: "basic express api backend",
      main: "src/index.ts",
      scripts: {
        start: "ts-node src/index.ts",
        dev: "nodemon src/index.ts",
        build: "tsc",
        "start:dist": "node dist/src/index.js",
        typecheck: "tsc --noEmit",
      },
      keywords: [],
      author: "Richard Tekula",
      license: "MIT",
      dependencies,
      devDependencies: {
        ...devDependencies,
        typescript: "^5.6.3",
        "ts-node": "^10.9.2",
        "@types/express": "^4.17.20",
        "@types/cors": "^2.8.17",
        "@types/morgan": "^1.9.9",
        "@types/node": "^22.7.5",
        "@typescript-eslint/eslint-plugin": "^7.16.1",
        "@typescript-eslint/parser": "^7.16.1",
      },
    };
  } else {
    // JavaScript variant
    packageJson = {
      name: projectName,
      version: "1.0.0",
      description: "basic express api backend",
      type: "module",
      main: "src/index.js",
      scripts: {
        dev: "nodemon src/index.js",
        start: "node src/index.js",
      },
      keywords: [],
      author: "Richard Tekula",
      license: "MIT",
      dependencies,
      devDependencies,
    };
  }

  // Write package.json
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // ****************
  // .env file
  // ****************
  // Always have a default PORT + extra lines for chosen DB if any
  const envContent = `PORT=5000
NODE_ENV=development
${envExtras}`;
  fs.writeFileSync(path.join(projectPath, ".env"), envContent);

  // ****************
  // ESLint settings
  // ****************
  if (useTypescript) {
    const eslintConfig = {
      root: true,
      env: {
        node: true,
        jest: true,
      },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      extends: "airbnb-typescript/base",
      plugins: ["import", "@typescript-eslint"],
      rules: {
        "comma-dangle": 0,
        "no-underscore-dangle": 0,
        "no-param-reassign": 0,
        "no-return-assign": 0,
        camelcase: 0,
        "import/extensions": 0,
        "@typescript-eslint/no-redeclare": 0,
      },
      settings: {
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
          typescript: {},
        },
      },
    };
    fs.writeFileSync(
      path.join(projectPath, ".eslintrc.json"),
      JSON.stringify(eslintConfig, null, 2)
    );

    // TSConfig (compiles to CommonJS)
    const tsconfig = {
      compilerOptions: {
        outDir: "dist",
        sourceMap: true,
        target: "esnext",
        module: "commonjs",
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        noImplicitAny: true,
        strict: true,
        skipLibCheck: true,
      },
      include: ["./*.js", "src/**/*.ts", "test/**/*.ts"],
    };
    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2)
    );
  } else {
    const eslintConfig = {
      env: {
        node: true,
        es6: true,
      },
      extends: "eslint:recommended",
      parserOptions: {
        sourceType: "module",
      },
      rules: {
        "no-console": "off",
      },
    };
    fs.writeFileSync(
      path.join(projectPath, ".eslintrc.json"),
      JSON.stringify(eslintConfig, null, 2)
    );
  }

  // **************************************
  // DB FILE: config/db.(js|ts)
  // **************************************
  let dbFileContent = "";
  if (dbChoice === "mongo") {
    // Simple Mongoose connect method, commented out in app
    dbFileContent = useTypescript
      ? `import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string, {
      // optional settings
    });
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
  }
}
`
      : `import mongoose from 'mongoose';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // optional settings
    });
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
  }
}
`;
  }

  if (dbChoice === "mongo") {
    const dbExtension = useTypescript ? "ts" : "js";
    fs.writeFileSync(
      path.join(projectPath, "src", "config", `db.${dbExtension}`),
      dbFileContent
    );
  }

  // ************************************
  // Create security middleware (validateBody)
  // ************************************
  // A complex regex that catches SQL/NoSQL injections, XSS, shell commands, etc.
  if (useTypescript) {
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "validateBody.ts"),
      `import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to prevent SQL injection, NoSQL injection, XSS, shell command injection, and JavaScript execution.
 */
export function validateBody(req: Request, res: Response, next: NextFunction) {
  const data = JSON.stringify({ body: req.body, query: req.query, params: req.params });

  // 🚨 Complex regex to detect dangerous patterns
  const dangerousPatterns = [
    /(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|LOAD_FILE|OUTFILE)\\b.*\\b(FROM|INTO|TABLE|DATABASE)\\b)/gi, // SQL injection
    /\\b(OR 1=1|AND 1=1|OR '1'='1'|--|#|\\/\\*|\\*\\/|;|\\bUNION\\b.*?\\bSELECT\\b)/gi, // Common SQL bypass tricks
    /\\b(\\$where|\\$ne|\\$gt|\\$lt|\\$regex|\\$exists|\\$not|\\$or|\\$and)\\b/gi, // NoSQL injection
    /(<script|<\\/script>|document\\.cookie|eval\\(|alert\\(|javascript:|onerror=|onmouseover=)/gi, // XSS
    /(\\bexec\\s*xp_cmdshell|\\bshutdown\\b|\\bdrop\\s+database|\\bdelete\\s+from)/gi, // OS Command Injection
    /(\\b(base64_decode|cmd|powershell|wget|curl|rm -rf|nc -e|perl -e|python -c)\\b)/gi, // Shell command injection
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(data)) {
      console.warn(\`❌ Suspicious input detected: \${data}\`);
      return res.status(400).json({ message: '🚨 Malicious content detected in request data' });
    }
  }

  next();
}
`
    );
  } else {
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "validateBody.js"),
      `/**
 * Middleware to prevent SQL injection, NoSQL injection, XSS, shell command injection, and JavaScript execution.
 */
export function validateBody(req, res, next) {
  const data = JSON.stringify({ body: req.body, query: req.query, params: req.params });

  // 🚨 Complex regex to detect dangerous patterns
  const dangerousPatterns = [
    /(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|LOAD_FILE|OUTFILE)\\b.*\\b(FROM|INTO|TABLE|DATABASE)\\b)/gi, // SQL injection
    /\\b(OR 1=1|AND 1=1|OR '1'='1'|--|#|\\/\\*|\\*\\/|;|\\bUNION\\b.*?\\bSELECT\\b)/gi, // Common SQL bypass tricks
    /\\b(\\$where|\\$ne|\\$gt|\\$lt|\\$regex|\\$exists|\\$not|\\$or|\\$and)\\b/gi, // NoSQL injection
    /(<script|<\\/script>|document\\.cookie|eval\\(|alert\\(|javascript:|onerror=|onmouseover=)/gi, // XSS
    /(\\bexec\\s*xp_cmdshell|\\bshutdown\\b|\\bdrop\\s+database|\\bdelete\\s+from)/gi, // OS Command Injection
    /(\\b(base64_decode|cmd|powershell|wget|curl|rm -rf|nc -e|perl -e|python -c)\\b)/gi, // Shell command injection
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(data)) {
      console.warn(\`❌ Suspicious input detected: \${data}\`);
      return res.status(400).json({ message: '🚨 Malicious content detected in request data' });
    }
  }

  next();
}
`
    );
  }

  // ********************************
  // Create the main source files
  // ********************************
  if (useTypescript) {
    // app.ts
    let appTsContent = `import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { validateBody } from './middlewares/global/validateBody';
import { notFound } from './middlewares/global/notFound';
import { errorHandler } from './middlewares/global/errorHandler';
import { MessageResponse } from './interfaces/MessageResponse';
`;

    // Show how to optionally import and connect to DB
    if (dbChoice === "mongo") {
      appTsContent += `\n// import { connectDB } from './config/db';\n// connectDB(); // Uncomment to enable DB connection\n`;
    }

    appTsContent += `
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Our custom body validation middleware
app.use(express.json(), validateBody);

// Basic route
app.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'Hi there!',
  });
});

// Global Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
`;
    fs.writeFileSync(path.join(projectPath, "src", "app.ts"), appTsContent);

    // index.ts
    const indexTsContent = `import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`;
    fs.writeFileSync(path.join(projectPath, "src", "index.ts"), indexTsContent);

    // Middlewares
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "notFound.ts"),
      `import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(\`🔍 Not Found - \${req.originalUrl}\`);
  next(error);
}
`
    );
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "errorHandler.ts"),
      `import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../../interfaces/ErrorResponse';

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const shortStack = err.stack ? err.stack.split('\\n')[0] : '';
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : shortStack,
  });
}
`
    );

    // Interfaces
    fs.mkdirpSync(path.join(projectPath, "src", "interfaces"));
    fs.writeFileSync(
      path.join(projectPath, "src", "interfaces", "MessageResponse.ts"),
      `export interface MessageResponse {
  message: string;
}
`
    );
    fs.writeFileSync(
      path.join(projectPath, "src", "interfaces", "ErrorResponse.ts"),
      `export interface ErrorResponse {
  message: string;
  stack?: string;
}
`
    );
  } else {
    // --- JS variant ---
    let appJsContent = `import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { validateBody } from './middlewares/global/validateBody.js';
import { notFound } from './middlewares/global/notFound.js';
import { errorHandler } from './middlewares/global/errorHandler.js';
`;

    if (dbChoice === "mongo") {
      appJsContent += `\n// import { connectDB } from './config/db.js';\n// connectDB(); // Uncomment to enable DB connection\n`;
    }

    appJsContent += `
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Our custom body validation middleware
app.use(express.json(), validateBody);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Hi there!',
  });
});

// Global Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
`;
    fs.writeFileSync(path.join(projectPath, "src", "app.js"), appJsContent);

    // index.js
    const indexJsContent = `import app from './app.js';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`;
    fs.writeFileSync(path.join(projectPath, "src", "index.js"), indexJsContent);

    // Middlewares
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "notFound.js"),
      `export function notFound(req, res, next) {
  res.status(404);
  const error = new Error(\`🔍 Not Found - \${req.originalUrl}\`);
  next(error);
}
`
    );
    fs.writeFileSync(
      path.join(projectPath, "src", "middlewares", "global", "errorHandler.js"),
      `export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const shortStack = err.stack ? err.stack.split('\\n')[0] : '';
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : shortStack,
  });
}
`
    );
  }

  // Light-blue icons in the final log messages
  const lightBlue = chalk.hex("#ADD8E6");
  console.log(chalk.green("✅ Projekt bol úspešne vytvorený!"));
  console.log(lightBlue(`📂  cd ${projectName}`));
  console.log(lightBlue("📦  npm install"));
  console.log(lightBlue("🚀  npm run dev"));

  // Explanation for TS vs JS file extensions:
  console.log();
  console.log(
    chalk.yellow(
      "Tip: In TypeScript (compiled to CommonJS), TS resolves imports without extensions automatically.\n" +
        "In pure JavaScript ESM ('type: module'), Node requires explicit '.js' file extensions in imports."
    )
  );
}

// ****************************
// Run if called directly
// ****************************
const mainFile = fileURLToPath(import.meta.url);
if (fs.realpathSync(process.argv[1]) === mainFile) {
  const args = process.argv.slice(2);

  // If user didn't specify arguments, show inquirer
  if (!args[0]) {
    inquirer
      .prompt([
        {
          name: "projectName",
          type: "input",
          message: "Enter the project name:",
          default: "backend",
        },
        {
          name: "language",
          type: "list",
          message: "Choose language:",
          choices: [
            { name: "TypeScript", value: "ts" },
            { name: "JavaScript", value: "js" },
          ],
        },
        {
          name: "database",
          type: "list",
          message: "Database:",
          choices: [
            { name: "None", value: "none" },
            { name: "MongoDB", value: "mongo" },
          ],
        },
      ])
      .then((answers) => {
        const { projectName, language, database } = answers;
        const isTs = language === "ts";
        createProject(projectName, isTs, database);
      })
      .catch((err) => {
        console.error(chalk.red("Error during project creation:"), err);
        process.exit(1);
      });
  } else {
    // If arguments were provided
    const projectName = args[0];
    const useTS = args.includes("--ts") || args.includes("-ts");

    // Simple DB arg check e.g. --db=mongo
    let dbChoice = "none";
    const dbArg = args.find((arg) => arg.startsWith("--db="));
    if (dbArg) {
      dbChoice = dbArg.split("=")[1];
    }

    if (!projectName) {
      console.error(chalk.red("❌ Prosím zadaj názov projektu."));
      process.exit(1);
    }
    createProject(projectName, useTS, dbChoice);
  }
}
