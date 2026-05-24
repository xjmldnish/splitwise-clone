const express = require('express')
const prisma = require('../lib/prisma')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

router.use(authMiddleware)

// Add an expense
router.post('/:groupId', async (req, res) => {
  try {
    const { description, amount, splitWith } = req.body
    const groupId = parseInt(req.params.groupId)

    // splitWith = array of userIds to split with (including yourself)
    const totalPeople = splitWith.length
    const amountOwed = amount / totalPeople

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        paidById: req.userId,
        groupId,
        splits: {
          create: splitWith.map(userId => ({
            userId,
            amountOwed: userId === req.userId ? 0 : amountOwed
          }))
        }
      },
      include: { splits: true }
    })

    res.json(expense)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Get all expenses for a group
router.get('/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId)

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
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// Get balances for a group
router.get('/:groupId/balances', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId)

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: { splits: true }
    })

    // Calculate balances
    const balances = {}

    expenses.forEach(expense => {
      // Person who paid gets credit
      if (!balances[expense.paidById]) balances[expense.paidById] = 0
      balances[expense.paidById] += expense.amount

      // Each person who owes gets debited
      expense.splits.forEach(split => {
        if (!balances[split.userId]) balances[split.userId] = 0
        balances[split.userId] -= split.amountOwed
      })
    })

    res.json(balances)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router