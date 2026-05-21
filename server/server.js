const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const logRoutes = require('./routes/logRoutes');

app.use('/api/logs', logRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('AI DevOps Log Analyzer Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});