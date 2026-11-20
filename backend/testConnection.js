// test DB connection
const sequelize = require('./src/config/database');
sequelize.authenticate()
  .then(() => console.log('Connection successful'))
  .catch(err => console.error('Connection error:', err.message));
