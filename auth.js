const express = require('express')
const passport = require('passport')
const User = require('../models/User')
const router = express.Router()

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, userType } = req.body

    try {
        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ message: 'User already exists' })
        }

        user = await User.create({
            name,
            email,
            password,
            userType,
        })

        req.login(user, (err) => {
            if (err) return next(err)
            res.status(201).json(user)
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
})

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user)
})

// Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('http://localhost:3000/dashboard') // Redirect to your frontend
    }
)

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err)
        res.redirect('/')
    })
})

// Get current user
router.get('/current-user', (req, res) => {
    res.json(req.user)
})

module.exports = router
