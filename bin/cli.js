#!/usr/bin/env node
import fs from "fs-extra";
import inquirer from "inquirer";
import chalk from "chalk";
import { fileURLToPath } from "url";
import path from "path";
import { createProject } from "./createProject.js";

const mainFile = fileURLToPath(import.meta.url);

if (fs.realpathSync(process.argv[1]) === mainFile) {
  const args = process.argv.slice(2);

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
        {
          name: "cloudinary",
          type: "confirm",
          message: "Add Cloudinary connection?",
          default: false,
        },
      ])
      .then((answers) => {
        const { projectName, language, database, cloudinary } = answers;
        const isTs = language === "ts";
        createProject(projectName, isTs, database, cloudinary);
      })
      .catch((err) => {
        console.error(chalk.red("Error during project creation:"), err);
        process.exit(1);
      });
  } else {
    const projectName = args[0];
    const useTS = args.includes("--ts") || args.includes("-ts");

    let dbChoice = "none";
    const dbArg = args.find((arg) => arg.startsWith("--db="));
    if (dbArg) {
      dbChoice = dbArg.split("=")[1];
    }

    const useCloudinary = args.includes("--cloudinary");

    if (!projectName) {
      console.error(chalk.red("❌ Prosím zadaj názov projektu."));
      process.exit(1);
    }
    createProject(projectName, useTS, dbChoice, useCloudinary);
  }
}