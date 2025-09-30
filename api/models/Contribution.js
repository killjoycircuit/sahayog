const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  contributionDate: {
    type: Date,
    default: Date.now
  },
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'mock_payment'
  },
  invoiceData: {
    contributorName: String,
    contributorEmail: String,
    eventTitle: String,
    eventCreator: String,
    transactionId: String,
    invoiceDate: Date,
    dueDate: Date
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate invoice number before saving
contributionSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Contribution').countDocuments();
    const invoiceNum = `INV-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    this.invoiceNumber = invoiceNum;
  }
  next();
});

// Index for better query performance
contributionSchema.index({ userId: 1, contributionDate: -1 });
contributionSchema.index({ eventId: 1, contributionDate: -1 });
contributionSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);