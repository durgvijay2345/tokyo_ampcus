const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./services/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'https://tokyo-ten-phi.vercel.app'] }));
app.use(express.json());

app.use('/api', apiRoutes);


connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` TOKYO PULSE API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });