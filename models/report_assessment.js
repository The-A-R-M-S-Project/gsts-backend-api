const mongoose = require('mongoose');

const reportAssessmentSchema = new mongoose.Schema({
  assessment: {
    background: {
      type: Number,
      min: [0, 'Background assessment cannot be negative'],
      max: [5, 'Background assessment cannot exceed maximum value[5]']
    },
    problemStatement: {
      type: Number,
      min: [0, 'ProblemStatement assessment cannot be negative'],
      max: [5, 'ProblemStatement assessment cannot exceed maximum value[5]']
    },
    researchMethods: {
      type: Number,
      min: [0, 'ResearchMethods assessment cannot be negative'],
      max: [20, 'ResearchMethods assessment cannot exceed maximum value[20]']
    },
    results: {
      type: Number,
      min: [0, 'Results assessment cannot be negative'],
      max: [15, 'Results assessment cannot exceed maximum value[15]']
    },
    discussions: {
      type: Number,
      min: [0, 'Discussions assessment cannot be negative'],
      max: [10, 'Discussions assessment cannot exceed maximum value[10]']
    },
    conclusions: {
      type: Number,
      min: [0, 'Assessment cannot be negative'],
      max: [5, 'Conclusions assessment cannot exceed maximum value[5]']
    },
    recommendations: {
      type: Number,
      min: [0, 'Recommendations assessment cannot be negative'],
      max: [5, 'Recommendations assessment cannot exceed maximum value[5]']
    },
    originality_of_Contribution: {
      type: Number,
      min: [0, 'Originality_of_Contribution assessment cannot be negative'],
      max: [15, 'Originality_of_Contribution assessment cannot exceed maximum value[15]']
    },
    literature_Citation: {
      type: Number,
      min: [0, 'literature_Citation assessment cannot be negative'],
      max: [10, 'literature_Citation assessment cannot exceed maximum value[10]']
    },
    overall_Presentation: {
      type: Number,
      min: [0, 'Overall_Presentation assessment cannot be negative'],
      max: [10, 'Overall_Presentation assessment cannot exceed maximum value[10]']
    },
    corrections: String
  },
  scannedAsssesmentform: String
});

module.exports = mongoose.model('reportAssessment', reportAssessmentSchema);
