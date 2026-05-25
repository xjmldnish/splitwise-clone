const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email)

router.post('/register', async (req, res) => {
  try {
    const name = req.body.name?.trim()
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already in use' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    })

    res.status(201).json({ message: 'Account created successfully', userId: user.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server authentication is not configured' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.post('/recover', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const password = req.body.password

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and new password are required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Use at least 8 characters for your new password' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const passwordHash = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      })
    }

    res.json({
      message: 'If an account exists for that email, the password has been updated. Your login username is your email address.'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const password = req.body.password

    if (!password) {
      return res.status(400).json({ error: 'Password confirmation is required' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user) return res.status(404).json({ error: 'Account not found' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(400).json({ error: 'Password confirmation did not match' })

    await prisma.$transaction(async (tx) => {
      const memberships = await tx.groupMember.findMany({
        where: { userId: req.userId },
        select: { groupId: true }
      })
      const groupIds = memberships.map(membership => membership.groupId)

      if (groupIds.length > 0) {
        const expenses = await tx.expense.findMany({
          where: { groupId: { in: groupIds } },
          select: { id: true }
        })
        const expenseIds = expenses.map(expense => expense.id)

        if (expenseIds.length > 0) {
          await tx.expenseSplit.deleteMany({
            where: { expenseId: { in: expenseIds } }
          })
        }

        await tx.settlement.deleteMany({
          where: {
            OR: [
              { groupId: { in: groupIds } },
              { payerId: req.userId },
              { receiverId: req.userId }
            ]
          }
        })
        await tx.expense.deleteMany({ where: { groupId: { in: groupIds } } })
        await tx.groupMember.deleteMany({ where: { groupId: { in: groupIds } } })
        await tx.group.deleteMany({ where: { id: { in: groupIds } } })
      }

      await tx.expenseSplit.deleteMany({ where: { userId: req.userId } })
      await tx.settlement.deleteMany({
        where: {
          OR: [
            { payerId: req.userId },
            { receiverId: req.userId }
          ]
        }
      })
      await tx.user.delete({ where: { id: req.userId } })
    })

    res.json({ message: 'Account deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router
