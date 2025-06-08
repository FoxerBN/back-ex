export const BASE_DEPENDENCIES = {
  express: "^4.21.1",
  cors: "^2.8.5",
  dotenv: "^16.4.5",
  helmet: "^8.0.0",
  morgan: "^1.10.0",
};

export const BASE_DEV_DEPENDENCIES = {
  nodemon: "^3.1.7",
  eslint: "latest",
};

export const TS_DEPENDENCIES = {
  // Only if you need runtime types
};

export const TS_DEV_DEPENDENCIES = {
  typescript: "^5.6.3",
  "ts-node": "^10.9.2",
  "@types/express": "^4.17.20",
  "@types/cors": "^2.8.17",
  "@types/morgan": "^1.9.9",
  "@types/node": "^22.7.5",
  "@typescript-eslint/eslint-plugin": "^7.16.1",
  "@typescript-eslint/parser": "^7.16.1",
};

export const DB_DEPENDENCIES = {
  mongo: {
    mongoose: "^7.3.2",
    "express-mongo-sanitize": "^2.2.0",
  },
};

export const CLOUDINARY_DEPENDENCY = {
  cloudinary: "^1.37.2",
};