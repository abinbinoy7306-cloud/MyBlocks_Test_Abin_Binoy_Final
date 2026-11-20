require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./src/routes');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Avoid alter mode on every boot: MySQL can accumulate duplicate indexes when
// Sequelize repeatedly reconciles existing unique columns. Migrations/model
// sync still create missing tables without rewriting the existing schema.
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(PORT, () => console.log(`NCLC Backend running on port ${PORT}`));
}).catch(err => console.error('DB sync failed:', err));
