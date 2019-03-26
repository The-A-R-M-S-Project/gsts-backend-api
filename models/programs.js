const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "student"
            }
        ]
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('program', ProgramSchema);