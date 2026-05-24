const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// All routes below require login
router.use(authMiddleware)

// Create a group
router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: { userId: req.userId }
        }
      }
    })
    res.json(group)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Get all groups for logged in user
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: req.userId } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    })
    res.json(groups)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Add member to group by email
router.post('/:groupId/members', async (req, res) => {
  try {
    const { email } = req.body
    const groupId = parseInt(req.params.groupId)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    await prisma.groupMember.create({
      data: { groupId, userId: user.id }
    })

    res.json({ message: `${user.name} added to group!` })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router