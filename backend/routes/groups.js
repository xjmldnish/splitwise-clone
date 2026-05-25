const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

const parseGroupId = (value) => {
  const groupId = Number.parseInt(value, 10)
  return Number.isInteger(groupId) && groupId > 0 ? groupId : null
}

const getMembership = (groupId, userId) => {
  return prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })
}

router.post('/', async (req, res) => {
  try {
    const name = req.body.name?.trim()
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' })
    }

    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: { userId: req.userId }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    })

    res.status(201).json(group)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: { some: { userId: req.userId } }
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(groups)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.post('/:groupId/members', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase()
    const groupId = parseGroupId(req.params.groupId)

    if (!groupId) return res.status(400).json({ error: 'Invalid group id' })
    if (!email) return res.status(400).json({ error: 'Email is required' })

    const membership = await getMembership(groupId, req.userId)
    if (!membership) return res.status(403).json({ error: 'You do not have access to this group' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const existingMember = await getMembership(groupId, user.id)
    if (existingMember) return res.status(409).json({ error: 'This user is already in the group' })

    await prisma.groupMember.create({
      data: { groupId, userId: user.id }
    })

    res.status(201).json({ message: `${user.name} added to group` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router
