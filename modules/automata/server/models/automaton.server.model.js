'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Automaton Schema
 */
var AutomatonSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  demo: { type: Boolean, default: false },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    trim: true,
    required: 'Title cannot be blank'
  },
  machine: {
    type: String,
    enum: ['tm', 'fsa', 'pda']
  },
  determ: { type: Boolean, default: true },
  tape: {
    position: Number,
    contents: [String]
  },
  eles: {
    nodes: [
      {
        data: {
          id: String,
          label: String,
          start: Boolean,
          accept: Boolean
        },
        position: {
          x: Number,
          y: Number
        },
        classes: String
      }
    ],
    edges: [
      { data:
        { source: String,
          target: String,
          read: String,
          action: String,
          label: String
        }
      }
    ]
  },
  alphabet: [String]
});

mongoose.model('Automaton', AutomatonSchema);
