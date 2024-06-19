const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutName: { type: String, required: true },
  weights: { type: Number, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
