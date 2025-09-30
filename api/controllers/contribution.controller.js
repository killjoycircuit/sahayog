const Contribution = require('../models/Contribution');
const Event = require('../models/Event');
const User = require('../models/User');
const emailService = require('../services/emailService');

// POST /api/contributions - Create new contribution
const createContribution = async (req, res) => {
  try {
    const { eventId, amount, contributorEmail } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid contribution data' });
    }

    // Get event and user details
    const event = await Event.findById(eventId).populate('createdBy', 'firstName lastName email');
    const user = await User.findById(userId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create contribution record
    const contributionData = {
      userId,
      eventId,
      amount: Number(amount),
      status: 'completed', // Mock payment always succeeds
      invoiceData: {
        contributorName: `${user.firstName} ${user.lastName}`,
        contributorEmail: contributorEmail || user.email,
        eventTitle: event.title,
        eventCreator: `${event.createdBy.firstName} ${event.createdBy.lastName}`,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        invoiceDate: new Date(),
        dueDate: new Date()
      }
    };

    const contribution = await Contribution.create(contributionData);

    // Update event's current amount
    event.currentAmount += Number(amount);
    await event.save();

    // Populate the contribution for response
    await contribution.populate([
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'eventId', select: 'title description createdBy' }
    ]);

    res.status(201).json({
      message: 'Contribution created successfully',
      contribution,
      eventCurrentAmount: event.currentAmount,
      progress: (event.currentAmount / event.amountToRaise) * 100
    });
  } catch (error) {
    console.error('Error creating contribution:', error);
    res.status(500).json({ error: 'Failed to create contribution' });
  }
};

// GET /api/contributions/user/:userId - Get user contributions
const getUserContributions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Ensure user can only access their own contributions or admin access
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const contributions = await Contribution.find({ userId })
      .populate('eventId', 'title description imageUrl createdBy amountToRaise currentAmount')
      .populate('userId', 'firstName lastName email')
      .sort({ contributionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contribution.countDocuments({ userId });

    res.json({
      contributions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    res.status(500).json({ error: 'Failed to fetch contributions' });
  }
};

// GET /api/contributions/:id/invoice - Get contribution invoice
const getContributionInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const contribution = await Contribution.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title description createdBy');

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Ensure user can only access their own invoice
    if (req.user.id !== contribution.userId._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      invoice: {
        invoiceNumber: contribution.invoiceNumber,
        contributionDate: contribution.contributionDate,
        amount: contribution.amount,
        status: contribution.status,
        ...contribution.invoiceData
      }
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// POST /api/contributions/:id/email-invoice - Email invoice
const emailInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const contribution = await Contribution.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title description createdBy');

    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    // Ensure user can only email their own invoice
    if (req.user.id !== contribution.userId._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recipientEmail = email || contribution.invoiceData.contributorEmail || contribution.userId.email;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'No email address provided' });
    }

    // Send invoice email
    await emailService.sendInvoiceEmail(recipientEmail, {
      invoiceNumber: contribution.invoiceNumber,
      contributionDate: contribution.contributionDate,
      amount: contribution.amount,
      status: contribution.status,
      ...contribution.invoiceData
    });

    // Update contribution record
    contribution.emailSent = true;
    contribution.emailSentAt = new Date();
    await contribution.save();

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ error: 'Failed to send invoice email' });
  }
};

// GET /api/contributions/stats/:userId - Get contribution statistics
const getContributionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own stats
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await Contribution.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalContributions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgContribution: { $avg: '$amount' },
          completedContributions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalContributions: 0,
      totalAmount: 0,
      avgContribution: 0,
      completedContributions: 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching contribution stats:', error);
    res.status(500).json({ error: 'Failed to fetch contribution statistics' });
  }
};

module.exports = {
  createContribution,
  getUserContributions,
  getContributionInvoice,
  emailInvoice,
  getContributionStats
};