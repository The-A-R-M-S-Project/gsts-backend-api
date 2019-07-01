const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
    {
        bioData: {
            first_name: {type: String, required: true},
            last_name: {type: String, required: true},
            email: {type: String, required: true, unique: true, trim: true},
            phoneNumber: {type: String, required: true, trim: true, unique: true},
        },
        password: {type: String, required: true, trim: true},
        program: {type: mongoose.Schema.Types.ObjectId, ref: "program"},
        yearOfStudy: Number,
        isRegistered: Boolean,
        plan: String,
        proposal: {supervisor: String,}
    }
);

module.exports = mongoose.model('student', StudentSchema);