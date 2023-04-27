const dotenv = require('dotenv');

let ENV_FILE_NAME = '';
switch (process.env.NODE_ENV) {
   case 'production':
      ENV_FILE_NAME = '.env.production';
      break;
   case 'staging':
      ENV_FILE_NAME = '.env.staging';
      break;
   case 'test':
      ENV_FILE_NAME = '.env.test';
      break;
   case 'development':
   default:
      ENV_FILE_NAME = '.env';
      break;
}

try {
   dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
   process.env.ADMIN_CORS ||
   'http://localhost:7000,http://localhost:7001';

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || 'http://localhost:8000';

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_DATABASE = process.env.DB_DATABASE;

const DATABASE_URL =
   `postgres://${DB_USERNAME}:${DB_PASSWORD}` +
   `@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';
// const DATABASE_URL =
//    process.env.DATABASE_URL || 'postgres://localhost/medusa-store';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const plugins = [
   `medusa-fulfillment-manual`,
   `medusa-payment-manual`,
   // To enable the admin plugin, uncomment the following lines and run `yarn add @medusajs/admin`
   {
      resolve: '@medusajs/admin',
      /** @type {import('@medusajs/admin').PluginOptions} */
      options: {
         autoRebuild: true,
         serve: true,
      },
   },
   {
      resolve: 'medusa-file-spaces',
      options: {
         spaces_url: process.env.SPACE_URL,
         bucket: process.env.SPACE_BUCKET,
         endpoint: process.env.SPACE_ENDPOINT,
         access_key_id: process.env.SPACE_ACCESS_KEY_ID,
         secret_access_key: process.env.SPACE_SECRET_ACCESS_KEY,
      },
   },

   {
      resolve: 'medusa-payment-stripe',
      options: {
         api_key: process.env.STRIPE_API_KEY,
         webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
      },
   },
];

const modules = {
   eventBus: {
      resolve: '@medusajs/event-bus-redis',
      options: {
         redisUrl: REDIS_URL,
      },
   },
   cacheService: {
      resolve: '@medusajs/cache-redis',
      options: {
         redisUrl: REDIS_URL,
      },
   },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
   jwtSecret: process.env.JWT_SECRET,
   cookieSecret: process.env.COOKIE_SECRET,
   database_type: 'postgres',
   store_cors: STORE_CORS,
   admin_cors: ADMIN_CORS,
   database_extra: { ssl: { rejectUnauthorized: false } },
   // Uncomment the following lines to enable REDIS
   redis_url: process.env.REDIS_URL,
};

if (DATABASE_URL && DATABASE_TYPE === 'postgres') {
   projectConfig.database_url = DATABASE_URL;
   delete projectConfig['database_database'];
}

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
   projectConfig,
   plugins,
   modules,
};
