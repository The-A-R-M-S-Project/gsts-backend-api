const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "course"
            }
        ]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('department', DepartmentSchema);