const port = 'PORT';

const databaseUrl = 'DATABASE_URL';
const databaseType = 'DATABASE_TYPE';
const databaseUser = 'DATABASE_USER';
const databasePassword = 'DATABASE_PASSWORD';
const databaseHost = 'DATABASE_HOST';
const databasePort = 'DATABASE_PORT';
const databaseDatabaseName = 'DATABASE_DATABASE_NAME';

const sentryDsn = 'SENTRY_DSN';

const saltOrRounds = 'SALT_OR_ROUNDS';
const accessToken = 'JWT_ACCESS_TOKEN';
const accessTokenExpires = 'JWT_ACCESS_TOKEN_EXPIRES';
const accessTokenSecret = 'JWT_ACCESS_TOKEN_SECRET';
const refreshToken = 'JWT_REFRESH_TOKEN';
const refreshTokenExpires = 'JWT_REFRESH_TOKEN_EXPIRES';
const refreshTokenSecret = 'JWT_REFRESH_TOKEN_SECRET';

const anonymousLimit = 'ANONYMOUS_LIMIT';
const anonymousDateLimit = 'ANONYMOUS_DATE_LIMIT';

export const envKey = {
  port,

  databaseUrl,
  databaseType,
  databaseUser,
  databasePassword,
  databaseHost,
  databasePort,
  databaseDatabaseName,

  sentryDsn,

  saltOrRounds,
  accessToken,
  accessTokenExpires,
  accessTokenSecret,
  refreshToken,
  refreshTokenExpires,
  refreshTokenSecret,

  anonymousLimit,
  anonymousDateLimit,
};
