const PORT = Number(process.env.PORT || 3000);

const MONGO_URL = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

export { PORT, MONGO_URL };
