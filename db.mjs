import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkoutCategory from './models/WorkoutCategory.mjs';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected successfully');

        const workouts = [
            { 
                category: 'Chest', 
                description: 'A chest workout exercise', 
                exercises: [
                    "Bench Press",
                    "Push-Ups",
                    "Chest Flyes",
                    "Dips",
                    "Incline Bench Press",
                    "Cable Crossovers",
                    "Pec Deck Machine",
                    "Decline Bench Press",
                    "Machine Chest Press",
                    "Push-Ups (Variations like Wide Grip, Close Grip)"
                ]
            },
            { 
                category: 'Back', 
                description: 'A back workout exercise', 
                exercises: [
                    "Pull-Ups/Chin-Ups",
                    "Deadlifts",
                    "Barbell Rows",
                    "Dumbbell Rows",
                    "Lat Pulldowns",
                    "T-Bar Rows",
                    "Seated Cable Rows",
                    "Hyperextensions",
                    "Single-Arm Dumbbell Rows",
                    "Good Mornings"
                ] 
            },
            { 
                category: 'Shoulders', 
                description: 'A shoulder workout exercise', 
                exercises: [
                    "Overhead Press (Barbell or Dumbbell)",
                    "Lateral Raises",
                    "Front Raises",
                    "Arnold Press",
                    "Upright Rows",
                    "Shoulder Press Machine",
                    "Face Pulls",
                    "Reverse Flyes",
                    "Shrugs (Barbell or Dumbbell)",
                    "Handstand Push-Ups"
                ]
            },
            { 
                category: 'Legs', 
                description: 'A leg workout exercise', 
                exercises: [
                    "Squats (Barbell or Dumbbell)",
                    "Deadlifts (Conventional or Sumo)",
                    "Leg Press",
                    "Lunges (Walking Lunges, Reverse Lunges)",
                    "Leg Extensions",
                    "Leg Curls",
                    "Calf Raises (Standing or Seated)",
                    "Glute Bridges",
                    "Step-Ups",
                    "Box Jumps"
                ]
            },
        ];
    
        await WorkoutCategory.deleteMany();
        await WorkoutCategory.insertMany(workouts);
    
        console.log('Work Out Data Imported!');

    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

export default connectDB;
