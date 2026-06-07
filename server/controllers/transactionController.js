const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const VALID_TYPES = ['deposit', 'sale', 'purchase', 'withdrawal', 'loss'];

// GET all transactions (with optional filters)
const getTransactions = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const filters = { userId: req.userId };

    if (type) filters.type = type;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.gte = new Date(startDate);
      if (endDate) filters.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      orderBy: { date: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET summary (total in, total out, net profit)
const getSummary = async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'

    let startDate;
    const now = new Date();

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filters = { userId: req.userId };
    if (startDate) filters.date = { gte: startDate };

    const transactions = await prisma.transaction.findMany({
      where: filters
    });

    const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === 'deposit' || t.type === 'sale') {
          acc.totalIn += t.amount;
        } else {
          acc.totalOut += t.amount;
        }
        return acc;
      },
      { totalIn: 0, totalOut: 0 }
    );

    summary.netProfit = summary.totalIn - summary.totalOut;
    summary.transactionCount = transactions.length;
    summary.period = period || 'all-time';

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create transaction
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Validation
    if (!amount || !type || !category || !date) {
      return res.status(400).json({ error: 'Amount, type, category and date are required' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Type must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        date: new Date(date),
        notes: notes || null,
        userId: req.userId
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update transaction
const updateTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Check ownership
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Validation
    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: `Type must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        amount: amount ? parseFloat(amount) : existing.amount,
        type: type || existing.type,
        category: category || existing.category,
        date: date ? new Date(date) : existing.date,
        notes: notes !== undefined ? notes : existing.notes
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE transaction
const deleteTransaction = async (req, res) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction
};