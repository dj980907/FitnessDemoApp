import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workout from './models/Workout.mjs';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected successfully');

        const workouts = [
            { category: 'Chest', description: 'A chest workout exercise', exercises: ['Bench Press', 'Chest Fly'] },
            { category: 'Back', description: 'A back workout exercise', exercises: ['Deadlift', 'Pull-up'] },
            { category: 'Shoulders', description: 'A shoulder workout exercise', exercises: ['Shoulder Press', 'Lateral Raise'] },
            { category: 'Legs', description: 'A leg workout exercise', exercises: ['Squat', 'Lunges'] },
        ];
    
        await Workout.deleteMany();
        await Workout.insertMany(workouts);
    
        console.log('Work Out Data Imported!');

    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

export default connectDB;
