# ✨ Express Backend Installer 🚀

This CLI tool, known as **back-ex**, scaffolds a **basic Express-based backend** (with optional MongoDB integration) in seconds. You can choose between **TypeScript** or **JavaScript** setups, automatically get a project folder structure, environment configuration, ESLint settings, security middleware, and more.

> **Important**: This is **not** available on the npm registry. You must clone this repository and link it locally to use the `back-ex` command.

## 🔥 Features

- ⚡ **Language Choice**: Quickly switch between TypeScript or JavaScript.
- 🍃 **Optional MongoDB Integration**: Sets up Mongoose and basic sanitization if you want a MongoDB database.
- 🛡️ **Security Middlewares**: Includes a powerful `validateBody` middleware to guard against common injection attacks (SQL, NoSQL, XSS).
- 🏗️ **Clean Folder Structure**: Preconfigured folders for controllers, routes, models, and utilities.
- ✨ **ESLint Configuration**: AirBnB-based config for TypeScript or a basic recommended set for JavaScript.

## 📦 Installation (Clone & Link)

Because this package is **not** on npm, you need to **clone** this repository and then link it locally to make the CLI globally accessible:

```bash
# 1) Clone the repository
git clone https://github.com/FoxerBN/back-ex.git
cd back-ex

# 2) Install dependencies (just once)
npm install

# 3) Link it
npm link
```

After running `npm link`, the command (shown below as `back-ex`) will be accessible from anywhere on your machine.

## 🛠️ Usage

Once linked, you can use the CLI in two ways:

### 1) Interactive Mode

Simply type the command (e.g. `back-ex`) with **no** extra arguments, and it will ask you for the required info:

```bash
back-ex
```

You will be prompted for:

1. **Project Name** (e.g. `my-express-app`)
2. **Language** (TypeScript or JavaScript)
3. **Database** (None or MongoDB)

### 2) Direct Arguments

You can skip the prompts by providing arguments. For example:

```bash
back-ex my-express-app --ts --db=mongo
```

- `my-express-app` is the folder to create.
- `--ts` tells the CLI to use TypeScript (omit or use `--js` if you want plain JavaScript).
- `--db=mongo` sets up Mongoose and sanitization (use `none` if you don’t want any DB).

### After the Project Is Generated

1. **Install Dependencies**:
   ```bash
   cd my-express-app
   npm install
   ```
2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
3. **Open the App**:
   The server starts at `http://localhost:5000` (or the port set in your `.env` file).

## 🗂️ Project Structure

Below is a quick overview of the generated structure (TypeScript variant shown):

```
my-express-app
├── .env
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── src
│   ├── app.ts
│   ├── index.ts
│   ├── config
│   │   └── db.ts        (only if MongoDB is chosen)
│   ├── middlewares
│   │   └── global
│   │       ├── validateBody.ts
│   │       ├── notFound.ts
│   │       └── errorHandler.ts
│   ├── controllers      (blank folder)
│   ├── models           (blank folder)
│   ├── routes           (blank folder)
│   ├── utils            (blank folder)
│   └── interfaces       (TS interfaces)
└── ...
```

**Key files**:

- **`src/app.(js|ts)`** – sets up Express, helmet, cors, basic route, and middlewares.
- **`src/index.(js|ts)`** – starts the server on the chosen port.
- **`src/middlewares/global/validateBody.(js|ts)`** – advanced regex-based injection prevention.
- **`src/config/db.(js|ts)`** – connects to MongoDB (if chosen).

## 📑 Notes

- If using **TypeScript**, you get a `tsconfig.json` configured to compile to CommonJS modules.
- If using **JavaScript**, your `package.json` includes `"type": "module"` to enable ES modules.
- For MongoDB projects, you’ll have a `MONGODB_URI` placeholder in your `.env`. Provide your actual connection string before running.
- The environment defaults to `PORT=5000` and `NODE_ENV=development`.

## 🙏 Contributing

Feel free to open issues or pull requests if you encounter bugs or want to suggest improvements!

## 📝 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

