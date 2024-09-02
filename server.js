const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')
const cors = require('cors')
require('dotenv').config()
require('./passport')

const app = express()

// CORS Middleware
app.use(cors())

// Body parsing middleware
app.use(express.json())

// Database connection
const mongoUri = process.env.MONGO_URI

mongoose
    .connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB connected')

        // Start the server only after MongoDB connection is established
        const PORT = process.env.PORT || 5000
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err)
    })

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'default_secret_key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: mongoUri }),
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24, // 1 day session expiration
        },
    })
)

app.use(passport.initialize())
app.use(passport.session())

// Mount the job routes at /api/jobs
const jobRoutes = require('./routes/jobs')
app.use('/api/jobs', jobRoutes)

// Google OAuth Routes
app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to your client-side application
        res.redirect('http://localhost:3000/dashboard') // Adjust to your frontend URL
    }
)

// Logout
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
