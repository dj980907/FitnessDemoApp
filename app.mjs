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
import connectDB from './db.mjs';
import bodyParser from 'body-parser';

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
    const { username, password } = req.body;

    const cleanUsername = sanitize(username);
    const cleanPassword = sanitize(password);

    try {
        const user = await User.findOne({ username: cleanUsername });

        if (user) {
            // const hashedPassword = await bcrypt.hash(cleanPassword, 10);
            const isMatch = await bcrypt.compare(cleanPassword, user.password);
            if (isMatch) {
                req.session.user = { id: user._id, email: user.email };
                // req.session.username = user.username;
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

// Workouts Route
app.get('/workouts', async (req, res) => {
    if (req.session.user) {
        try {
            const categories = await Workout.distinct('category');
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
            const workouts = await Workout.find({ category });
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
