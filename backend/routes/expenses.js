const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

const parseGroupId = (value) => {
  const groupId = Number.parseInt(value, 10)
  return Number.isInteger(groupId) && groupId > 0 ? groupId : null
}

const requireGroupMembership = async (groupId, userId) => {
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } }
  })
  return Boolean(membership)
}

router.post('/:groupId', async (req, res) => {
  try {
    const groupId = parseGroupId(req.params.groupId)
    const description = req.body.description?.trim()
    const amount = Number(req.body.amount)
    const splitWith = req.body.splitWith

    if (!groupId) return res.status(400).json({ error: 'Invalid group id' })
    if (!description) return res.status(400).json({ error: 'Description is required' })
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }
    if (!Array.isArray(splitWith) || splitWith.length === 0) {
      return res.status(400).json({ error: 'Choose at least one member to split with' })
    }

    const hasAccess = await requireGroupMembership(groupId, req.userId)
    if (!hasAccess) return res.status(403).json({ error: 'You do not have access to this group' })

    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true }
    })
    const memberIds = new Set(groupMembers.map(member => member.userId))
    const uniqueSplitWith = [...new Set(splitWith.map(userId => Number(userId)))]

    if (!uniqueSplitWith.includes(req.userId)) uniqueSplitWith.push(req.userId)
    if (uniqueSplitWith.some(userId => !memberIds.has(userId))) {
      return res.status(400).json({ error: 'Expenses can only be split with group members' })
    }

    const amountOwed = Number((amount / uniqueSplitWith.length).toFixed(2))
    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        paidById: req.userId,
        groupId,
        splits: {
          create: uniqueSplitWith.map(userId => ({
            userId,
            amountOwed
          }))
        }
      },
      include: {
        paidBy: { select: { id: true, name: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    })

    res.status(201).json(expense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/:groupId', async (req, res) => {
  try {
    const groupId = parseGroupId(req.params.groupId)

    if (!groupId) return res.status(400).json({ error: 'Invalid group id' })

    const hasAccess = await requireGroupMembership(groupId, req.userId)
    if (!hasAccess) return res.status(403).json({ error: 'You do not have access to this group' })

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: { select: { id: true, name: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(expenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/:groupId/balances', async (req, res) => {
  try {
    const groupId = parseGroupId(req.params.groupId)

    if (!groupId) return res.status(400).json({ error: 'Invalid group id' })

    const hasAccess = await requireGroupMembership(groupId, req.userId)
    if (!hasAccess) return res.status(403).json({ error: 'You do not have access to this group' })

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    })

    const balances = {}

    expenses.forEach(expense => {
      if (!balances[expense.paidById]) balances[expense.paidById] = 0
      balances[expense.paidById] += expense.amount

      expense.splits.forEach(split => {
        if (!balances[split.userId]) balances[split.userId] = 0
        balances[split.userId] -= split.amountOwed
      })
    })

    Object.keys(balances).forEach(userId => {
      balances[userId] = Number(balances[userId].toFixed(2))
    })

    res.json(balances)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router
