const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
    {
        bioData: {
            name: {type: String, required: true},
            netID: {type: String, required: true},
            phoneNumber: {type: String, required: true},
        },
        course: {type: mongoose.Schema.Types.ObjectId, ref: "course"},
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