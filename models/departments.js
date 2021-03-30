const mongoose = require('mongoose');

const Report = require('./reports');
const Student = require('./students');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'school' }
});

DepartmentSchema.statics.getDepartmentPerformance = async function(departmentId) {
  const departmentName = await this.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');
  const numA = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'A' }
      }
    }
  ]);
  const numB = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'B' }
      }
    }
  ]);
  const numC = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'C' }
      }
    }
  ]);
  const numD = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'D' }
      }
    }
  ]);
  const numE = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'E' }
      }
    }
  ]);
  const numF = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        examinerGrade: { $eq: 'F' }
      }
    }
  ]);

  return {
    [departmentName.name]: [
      numA.length,
      numB.length,
      numC.length,
      numD.length,
      numE.length,
      numF.length
    ]
  };
};

DepartmentSchema.statics.getDepartmentReportStatus = async function(departmentId) {
  const departmentName = await this.findById(departmentId);
  const studentIds = await Student.find({ department: departmentId }).distinct('_id');
  const submitted = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'submitted' }
      }
    }
  ]);
  const withExaminer = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'receivedByExaminers' }
      }
    }
  ]);
  const cleared = await Report.aggregate([
    {
      $match: { student: { $in: studentIds } }
    },
    {
      $match: {
        status: { $eq: 'clearedByExaminers' }
      }
    }
  ]);
  return {
    [departmentName.name]: {
      submitted: submitted.length,
      withExaminers: withExaminer.length,
      clearedByExaminers: cleared.length
    }
  };
};

module.exports = mongoose.model('department', DepartmentSchema);
