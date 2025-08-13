const mongoose = require('mongoose');
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'design',
      'music',
      'technology',
      'games',
      'publishing',
      'film',
      'art',
      'food',
      'fashion',
      'crafts',
      'theater',
      'comics',
      'dance',
      'photography'
    ],
  },
  description: {
    type: String,
    required: true,
    maxlength: 150,
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  raisedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'End date must be in the future',
    },
  },
  status: {
    type: String,
    enum: ['active', 'funded', 'expired', 'cancelled'],
    default: 'active',
  },
  backers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    backedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  images: [{
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String, // Cloudinary public ID for deletion
      required: true,
    },
    alt_text: {
      type: String,
      default: '',
    },
    uploaded_at: {
      type: Date,
      default: Date.now,
    }
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  updates: [{
    title: String,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to calculate funding percentage
EventSchema.virtual('fundingPercentage').get(function() {
  return Math.round((this.raisedAmount / this.targetAmount) * 100);
});

// Virtual field to calculate days remaining
EventSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.endDate - now;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysRemaining > 0 ? daysRemaining : 0;
});

// Validation to limit maximum number of images to 5
EventSchema.pre('save', function(next) {
  if (this.images && this.images.length > 5) {
    const error = new Error('Maximum 5 images allowed per event');
    return next(error);
  }
  next();
});

// Index for better query performance
EventSchema.index({ category: 1, status: 1 });
EventSchema.index({ creator: 1 });
EventSchema.index({ endDate: 1 });

const EventModel = mongoose.model('Event', EventSchema);

module.exports = EventModel;