/**
 * models/Ticket.js
 * -----------------------------------------------------------------------
 * Ticket schema representing an IT service request submitted by an
 * Employee and managed/updated by an Admin.
 * -----------------------------------------------------------------------
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;

const TicketSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be one of: Low, Medium, High',
      },
      required: [true, 'Priority is required'],
      default: 'Low',
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: 'Status must be one of: Open, In Progress, Resolved',
      },
      default: 'Open',
    },
    category: {
      type: String,
      enum: ['Hardware', 'Software', 'Network', 'Access', 'Other'],
      default: 'Other',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdByUsername: {
      type: String,
      required: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

// Compound index to speed up "my tickets" queries with sorting
TicketSchema.index({ createdBy: 1, createdAt: -1 });
TicketSchema.index({ status: 1, priority: 1 });
TicketSchema.index({ title: 'text', description: 'text' }); // supports admin search

module.exports = mongoose.model('Ticket', TicketSchema);
