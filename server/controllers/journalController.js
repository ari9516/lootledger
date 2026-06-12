const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all journal entries for user
const getJournalEntries = async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET journal summary (total staked, total profit, total loss)
const getJournalSummary = async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId }
    });

    const summary = entries.reduce((acc, entry) => {
      acc.totalStaked += entry.stakedAmount;
      acc.totalProfit += entry.profitAmount;
      acc.totalLoss += entry.lossAmount;
      acc.totalNetResult += entry.netResult;
      return acc;
    }, { totalStaked: 0, totalProfit: 0, totalLoss: 0, totalNetResult: 0 });

    summary.entryCount = entries.length;
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create journal entry
const createJournalEntry = async (req, res) => {
  try {
    const { date, stakedAmount, profitAmount, lossAmount, notes } = req.body;

    // Validate
    if (!date || !stakedAmount) {
      return res.status(400).json({ error: 'Date and staked amount are required' });
    }

    // Calculate net result
    const profit = parseFloat(profitAmount) || 0;
    const loss = parseFloat(lossAmount) || 0;
    const netResult = profit - loss;

    // Check if entry for this date already exists
    const existing = await prisma.journalEntry.findFirst({
      where: { 
        date: new Date(date),
        userId: req.userId 
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Entry for this date already exists' });
    }

    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        stakedAmount: parseFloat(stakedAmount),
        profitAmount: profit,
        lossAmount: loss,
        netResult: netResult,
        notes: notes || null,
        userId: req.userId
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update journal entry
const updateJournalEntry = async (req, res) => {
  try {
    const { stakedAmount, profitAmount, lossAmount, notes } = req.body;

    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const profit = parseFloat(profitAmount) || existing.profitAmount;
    const loss = parseFloat(lossAmount) || existing.lossAmount;
    const netResult = profit - loss;

    const updated = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: {
        stakedAmount: stakedAmount ? parseFloat(stakedAmount) : existing.stakedAmount,
        profitAmount: profit,
        lossAmount: loss,
        netResult: netResult,
        notes: notes !== undefined ? notes : existing.notes
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await prisma.journalEntry.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getJournalEntries,
  getJournalSummary,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
};
