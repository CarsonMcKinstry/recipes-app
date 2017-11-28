const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbUrl = process.env.DB_URL;

export default `mongodb://${dbUser}:${dbPassword}@${dbUrl}`;
