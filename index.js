const express = require('express')
require('dotenv').config();

const app = express();

app.get('/', (req, res) => {
  res.redirect('https://github.com/dragonismcode/fxtiktok');
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});