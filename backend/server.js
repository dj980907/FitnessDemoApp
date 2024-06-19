const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/workoutApp', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
