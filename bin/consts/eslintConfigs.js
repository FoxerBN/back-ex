export const ESLINT_CONFIG_TS = {
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

export const ESLINT_CONFIG_JS = {
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

export const TSCONFIG = {
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