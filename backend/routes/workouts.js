const express = require('express');
const Workout = require('../models/Workout');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { workoutName, weights, sets, reps } = req.body;
  const userId = req.user.id;
  try {
    const workout = new Workout({ userId, workoutName, weights, sets, reps });
    await workout.save();
    res.status(201).send('Workout added');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const workouts = await Workout.find({ userId });
    res.json(workouts);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/all', verifyToken, async (req, res) => {
  if (req.user.role !== 'trainer') {
    return res.status(403).send('Access denied');
  }
  try {
    const workouts = await Workout.find().populate('userId', 'username');
    res.json(workouts);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
