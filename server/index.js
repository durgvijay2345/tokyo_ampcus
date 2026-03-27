require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./services/database');


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());




connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(` TOKYO PULSE API running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error(' Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
app.get("/", (req, res) => {
  res.send(" TOKYO PULSE API is running");
});