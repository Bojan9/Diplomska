const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = './data.json';

// Load or initialize data
let data = { dids: [], votes: [], vcs: [] };
if (fs.existsSync(DB_FILE)) {
  data = JSON.parse(fs.readFileSync(DB_FILE));
}

const saveData = () => fs.writeFileSync(DB_FILE, JSON.stringify(data));

// Routes
app.get('/data', (req, res) => res.json(data));

app.post('/data', (req, res) => {
  data = req.body;
  saveData();
  res.sendStatus(200);
});

app.listen(4000, () => console.log('Server running on port 4000'));
