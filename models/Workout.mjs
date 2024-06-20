import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    workoutName: {
        type: String,
        required: true,
    },
    sets: {
      type: Number,
    },
    reps: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Workout", WorkoutSchema);