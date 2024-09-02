const express = require('express')
const Job = require('../models/Job')
const User = require('../models/User')

const router = express.Router()

// @route   GET /api/jobs
// @desc    Get all job listings
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find()
        res.json(jobs)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/jobs/:id
// @desc    Get a job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('user') // Populate the user info
        if (!job) {
            return res.status(404).json({ message: 'Job not found' })
        }
        res.json(job)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/jobs
// @desc    Create a new job listing
router.post('/', async (req, res) => {
    const { title, description, location, category, salary, userId } = req.body

    // Find the user and check if they are a jobPoster
    const user = await User.findById(userId)
    if (!user || user.userType !== 'jobPoster') {
        return res
            .status(403)
            .json({ message: 'You are not authorized to post jobs' })
    }

    const newJob = new Job({
        title,
        description,
        location,
        category,
        salary,
        user: userId,
    })

    try {
        const savedJob = await newJob.save()
        res.status(201).json(savedJob)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   PUT /api/jobs/:id
// @desc    Update a job listing
router.put('/:id', async (req, res) => {
    const { skills, gallery } = req.body

    // Find the user and check if they are a serviceProvider
    const user = await User.findById(req.params.id)
    if (!user || user.userType !== 'serviceProvider') {
        return res
            .status(403)
            .json({ message: 'You are not authorized to update this profile' })
    }

    // Update skills and gallery
    if (skills) user.skills = skills
    if (gallery) user.gallery = gallery

    try {
        const updatedUser = await user.save()
        res.json(updatedUser)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   DELETE /api/jobs/:id
// @desc    Delete a job listing
router.delete('/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id)
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' })
        }
        res.json({ message: 'Job removed' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router
