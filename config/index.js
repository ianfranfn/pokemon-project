import 'dotenv/config';

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'secretkey',
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  },
};
