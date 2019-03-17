const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        departments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "department"
            }
        ]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('school', SchoolSchema);