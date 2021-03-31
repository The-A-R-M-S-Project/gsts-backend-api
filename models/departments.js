const mongoose = require('mongoose');

const Report = require('./reports');
const Student = require('./students');

function* repeat(x) {
  while (true) yield x;
}

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'school' }
});

DepartmentSchema.statics.getDepartmentPerformance = async function(departmentId) {
  const departmentName = await this.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');

  const performanceStats = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 }
      }
    }
  ]);

  let [numA, numB, numC, numD, numE, numF] = repeat(0);

  performanceStats.forEach(function(status) {
    switch (status._id) {
      case 'A':
        numA = status.count;
        break;
      case 'B':
        numB = status.count;
        break;
      case 'C':
        numC = status.count;
        break;
      case 'D':
        numD = status.count;
        break;
      case 'E':
        numE = status.count;
        break;
      case 'F':
        numF = status.count;
        break;
      default:
        break;
    }
  });

  return {
    [departmentName.name]: { A: numA, B: numB, C: numC, D: numD, E: numE, F: numF }
  };
};

DepartmentSchema.statics.getDepartmentReportStatus = async function(departmentId) {
  const departmentName = await this.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');

  const reportStatusStats = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  let [
    notSubmitted,
    submitted,
    assignedToExaminers,
    receivedByExaminers,
    clearedByExaminers,
    vivaDateSet,
    vivaComplete,
    complete
  ] = repeat(0);

  reportStatusStats.forEach(function(status) {
    switch (status._id) {
      case 'notSubmitted':
        notSubmitted = status.count;
        break;
      case 'submitted':
        submitted = status.count;
        break;
      case 'assignedToExaminers':
        assignedToExaminers = status.count;
        break;
      case 'receivedByExaminers':
        receivedByExaminers = status.count;
        break;
      case 'clearedByExaminers':
        clearedByExaminers = status.count;
        break;
      case 'vivaDateSet':
        vivaDateSet = status.count;
        break;
      case 'vivaComplete':
        vivaComplete = status.count;
        break;
      case 'complete':
        complete = status.count;
        break;
      default:
        break;
    }
  });

  return {
    [departmentName.name]: {
      notSubmitted: notSubmitted,
      submitted: submitted,
      assignedToExaminers: assignedToExaminers,
      receivedByExaminers: receivedByExaminers,
      clearedByExaminers: clearedByExaminers,
      vivaDateSet: vivaDateSet,
      vivaComplete: vivaComplete,
      complete: complete
    }
  };
};

module.exports = mongoose.model('department', DepartmentSchema);
