export const dbFileTemplate = (ts) =>
  ts
    ? `import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err);
    process.exit(1);
  }
}
`;

export const cloudinaryFileTemplate = (ts) =>
  `import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export default cloudinary;
`;

export const validateBodyTemplate = (ts) =>
  ts
    ? `import { Request, Response, NextFunction } from 'express';

export function validateBody(req: Request, res: Response, next: NextFunction) {
  const data = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  const dangerousPatterns = [
    /(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|LOAD_FILE|OUTFILE)\\b.*\\b(FROM|INTO|TABLE|DATABASE)\\b)/gi,
    /\\b(OR 1=1|AND 1=1|OR '1'='1'|--|#|\\/\\*|\\*\\/|;|\\bUNION\\b.*?\\bSELECT\\b)/gi,
    /\\b(\\$where|\\$ne|\\$gt|\\$lt|\\$regex|\\$exists|\\$not|\\$or|\\$and)\\b/gi,
    /(<script|<\\/script>|document\\.cookie|eval\\(|alert\\(|javascript:|onerror=|onmouseover=)/gi,
    /(\\bexec\\s*xp_cmdshell|\\bshutdown\\b|\\bdrop\\s+database|\\bdelete\\s+from)/gi,
    /(\\b(base64_decode|cmd|powershell|wget|curl|rm -rf|nc -e|perl -e|python -c)\\b)/gi,
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
    : `export function validateBody(req, res, next) {
  const data = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  const dangerousPatterns = [
    /(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC|UNION|LOAD_FILE|OUTFILE)\\b.*\\b(FROM|INTO|TABLE|DATABASE)\\b)/gi,
    /\\b(OR 1=1|AND 1=1|OR '1'='1'|--|#|\\/\\*|\\*\\/|;|\\bUNION\\b.*?\\bSELECT\\b)/gi,
    /\\b(\\$where|\\$ne|\\$gt|\\$lt|\\$regex|\\$exists|\\$not|\\$or|\\$and)\\b/gi,
    /(<script|<\\/script>|document\\.cookie|eval\\(|alert\\(|javascript:|onerror=|onmouseover=)/gi,
    /(\\bexec\\s*xp_cmdshell|\\bshutdown\\b|\\bdrop\\s+database|\\bdelete\\s+from)/gi,
    /(\\b(base64_decode|cmd|powershell|wget|curl|rm -rf|nc -e|perl -e|python -c)\\b)/gi,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(data)) {
      console.warn(\`❌ Suspicious input detected: \${data}\`);
      return res.status(400).json({ message: '🚨 Malicious content detected in request data' });
    }
  }
  next();
}
`;

export const notFoundTemplate = (ts) =>
  ts
    ? `import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(\`🔍 Not Found - \${req.originalUrl}\`);
  next(error);
}
`
    : `export function notFound(req, res, next) {
  res.status(404);
  const error = new Error(\`🔍 Not Found - \${req.originalUrl}\`);
  next(error);
}
`;

export const errorHandlerTemplate = (ts) =>
  ts
    ? `import { Request, Response, NextFunction } from 'express';
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
    : `export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const shortStack = err.stack ? err.stack.split('\\n')[0] : '';
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : shortStack,
  });
}
`;

export const appTemplate = (ts, dbChoice) => {
  let imports = ts
    ? `import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { validateBody } from './middlewares/global/validateBody';
import { notFound } from './middlewares/global/notFound';
import { errorHandler } from './middlewares/global/errorHandler';
import { MessageResponse } from './interfaces/MessageResponse';
`
    : `import express from 'express';
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
    imports += ts
      ? `\n// import { connectDB } from './config/db';\nimport mongoSanitize from 'express-mongo-sanitize';\n// connectDB(); // Uncomment to enable DB connection\n// mongoSanitize()`
      : `\n// import { connectDB } from './config/db.js';\nimport mongoSanitize from 'express-mongo-sanitize';\n// connectDB(); \n// Uncomment to enable DB connection\n// mongoSanitize()`;
  }

  return (
    imports +
    `
const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

// Our custom body validation middleware
app.use(express.json(), validateBody);

// Basic route
app.get${ts ? "<{}, MessageResponse>" : ""}('/', (req, res) => {
  res.json({
    message: 'Hi there!',
  });
});

// Global Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
`
  );
};

export const indexTemplate = (ts) =>
  ts
    ? `import app from './app';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`
    : `import app from './app.js';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(\`🚀 Server running on http://localhost:\${port}\`);
});
`;

export const messageResponseTemplate = `export interface MessageResponse {
  message: string;
}
`;

export const errorResponseTemplate = `export interface ErrorResponse {
  message: string;
  stack?: string;
}
`;