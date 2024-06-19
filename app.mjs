import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';

const app = express();

// Set up templating engine
app.set('view engine', 'hbs');

// Get current file and directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Set up middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Configure session management
const sessionOptions = {
    secret: 'secret for signing session id',
    saveUninitialized: false,
    resave: false,
    cookie: {
        secure: false, // Set to true in production if using HTTPS
        httpOnly: true, // Prevents client-side JS from accessing the cookie
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}

app.use(session(sessionOptions));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Home route
app.get('/', (req, res) => {
    res.send("hi!")
});

// Start the server
app.listen(3000, () => {
    console.log("App is listening on port 3000");
});
