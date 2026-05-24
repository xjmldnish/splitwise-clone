const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Email already in use' })

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    })

    res.json({ message: 'Account created successfully!', userId: user.id })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid email or password' })

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' })

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router