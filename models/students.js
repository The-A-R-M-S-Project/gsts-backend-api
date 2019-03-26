const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
    {
        bioData: {
            name: {type: String, required: true},
            netID: {type: String, required: true},
            phoneNumber: {type: String, required: true},
        },
        program: {type: mongoose.Schema.Types.ObjectId, ref: "program"},
        yearOfStudy: Number,
        isRegistered: Boolean,
        plan: String,
        proposal: {supervisor: String,}
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model('student', StudentSchema);