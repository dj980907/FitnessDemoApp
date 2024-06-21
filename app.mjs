import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import dotenv from 'dotenv';
import User from './models/User.mjs';
import Workout from './models/Workout.mjs';
import WorkoutCategory from './models/WorkoutCategory.mjs';
import connectDB from './db.mjs';
import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set the view engine
app.set('view engine', 'hbs');

// Get current file and directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Configure session management
const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for session secret
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
};

app.use(session(sessionOptions));

// Rate limiting
const limiter = rateLimit({
    // 15 minutes
    windowMs: 15 * 60 * 1000,
    // limit each IP to 100 requests per windowMs
    max: 100
});

app.use(limiter);

// Middleware to set the user data for templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER
// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER
// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Signup route
app.get('/signup', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('signup');
    }
});

app.post('/signup', async (req, res) => {
    const { firstname, lastname, email, password, confirmPassword } = req.body;

    // Check if all fields are provided
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
        return res.render('signup', { error: 'All fields are required' });
    }

    // Check if email is valid
    if (!validator.isEmail(email)) {
        return res.render('signup', { error: 'Invalid email address' });
    }

    // Check if password is at least 8 characters long
    if (!validator.isLength(password, { min: 8 })) {
        return res.render('signup', { error: 'Password must be at least 8 characters long' });
    }

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        return res.render('signup', { error: 'Passwords do not match' });
    }

    const cleanFirstName = sanitize(firstname);
    const cleanLastName = sanitize(lastname);
    const cleanEmail = sanitize(email);
    const cleanPassword = sanitize(password);

    try {
        const foundUser = await User.findOne({ email: cleanEmail }).exec();

        if (foundUser) {
            return res.render('signup', { error: 'Email is already in use' });
        } else {
            const hashedPassword = await bcrypt.hash(cleanPassword, 10);
            const newUser = new User({
                firstname: cleanFirstName,
                lastname: cleanLastName,
                email: cleanEmail,
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            req.session.user = { id: savedUser._id, email: savedUser.email };
            res.redirect('/dashboard');
        }
    } catch (e) {
        console.log(e);
        res.render('signup', { error: 'Unable to register' });
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Login route
app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const cleanEmail = sanitize(email);
    const cleanPassword = sanitize(password);

    try {
        const user = await User.findOne({ email: cleanEmail });

        if (user) {
            const isMatch = await bcrypt.compare(cleanPassword, user.password);
            if (isMatch) {
                req.session.user = { id: user._id, email: user.email };
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid credentials' });
            }
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (e) {
        console.log(e);
        res.render('login', { error: 'Unable to login' });
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard');
    } else {
        res.redirect('/login');
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Plans Route
app.get('/plans', (req, res) => {
    res.render('plans');
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// checkout Route
app.get('/checkout', (req, res) => {
    if (req.session.user) {
        res.render('checkout');
    } else {
        res.redirect('/login');
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Workouts Route
app.get('/workouts', async (req, res) => {
    if (req.session.user) {
        try {
            const categories = await WorkoutCategory.distinct('category');
            res.render('workouts', { categories });
        } catch (err) {
            console.log(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});

// Dynamic category routes
app.get('/workouts/:category', async (req, res) => {
    if (req.session.user) {
        const category = req.params.category;
        try {
            const workouts = await WorkoutCategory.find({ category });
            res.render('category-workouts', { category, workouts });
        } catch (err) {
            console.log(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Diary Route
app.get('/diary', (req, res) => {
    if (req.session.user) {
        res.render('diary');
    } else {
        res.redirect('/login');
    }
});

app.post('/diary', async (req, res) => {
    const { category, workoutName, sets, reps, weight } = req.body;
    const userId = req.session.user.id;

    try {
        const newWorkout = new Workout({
            category,
            workoutName,
            sets,
            reps,
            weight
        });

        const savedWorkout = await newWorkout.save();

        const user = await User.findById(userId);
        user.workouts.push(savedWorkout);
        await user.save();

        res.redirect('/diary');
    } catch (e) {
        console.log(e);
        res.render('diary', { error: 'Unable to add workout' });
    }
});

// Fetch workouts for a specific date
app.get('/diary/:date', async (req, res) => {
    const { date } = req.params;
    const userId = req.session.user.id;

    try {
        const user = await User.findById(userId).populate('workouts').exec();
        const workoutsForDate = user.workouts.filter(workout => {
            return workout.date.toISOString().split('T')[0] === date;
        });

        res.json({ workouts: workoutsForDate });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Unable to fetch workouts' });
    }
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

const sanitizeAndValidateInput = [
    body('cardNumber').trim().isNumeric().isLength({ min: 16, max: 16 }),
    body('expiryDate').trim().isLength({ min: 5, max: 5 }).matches(/^(0[1-9]|1[0-2])\/\d{2}$/),
    body('cvv').trim().isNumeric().isLength({ min: 3, max: 3 }),
    body('cardHolderName').trim().isString().isLength({ min: 2 })
];

// payment processing route
app.post('/process-payment', (req, res) => {

    // Sanitized and validated data from request body
    const { cardNumber, expiryDate, cvv, cardHolderName } = req.body;

    const cleanCardNumber = sanitize(cardNumber);
    const cleanExpiryDate = sanitize(expiryDate);
    const cleanCVV = sanitize(cvv);
    const cleanCardHolderName = sanitize(cardHolderName);

    // For Demo purposes, just send a success response
    console.log('Received payment details:', { cleanCardNumber, cleanExpiryDate, cleanCVV, cleanCardHolderName });
    res.status(200).json({ message: 'Payment successful!' });
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

app.get('/logout', (req, res) => {

    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect('/dashboard');
        }
        // Clear the session cookie
        res.clearCookie('connect.sid');
        // Redirect to login page after logout
        res.redirect('/login'); 
    });
});

// DIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDERDIVIDER

// Connect to the database and start the server
connectDB().then(() => {
    app.listen(3000, () => {
        console.log("App is listening on port 3000");
    });
});
