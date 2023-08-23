const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required for the location!']
    },
    timeLabel: {
      type: String,
      required: [true, 'Time is required for the location!'],
    },
    sequenceNumber: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Location = mongoose.model('location', locationSchema);

module.exports = Location;
