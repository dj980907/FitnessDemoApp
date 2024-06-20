import mongoose from "mongoose";

const WorkoutCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    exercises: [
      {
          type: String,
          required: true,
      }
    ],
  }
);

export default mongoose.model("WorkoutCategory", WorkoutCategorySchema);