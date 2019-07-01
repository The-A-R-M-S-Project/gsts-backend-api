const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const StudentSchema = new mongoose.Schema(
    {
        bioData: {
            firstName: {type: String, required: true},
            lastName: {type: String, required: true},
            email: {type: String, required: true, unique: true, trim: true},
            phoneNumber: {type: String, required: true, trim: true, unique: true},
            // todo: Add validation for phone number
        },
        password: {type: String, required: true, trim: true},
        program: {type: mongoose.Schema.Types.ObjectId, ref: "program"},
        yearOfStudy: Number,
        isRegistered: Boolean,
        plan: String,
        proposal: {supervisor: String,}
    }
);

StudentSchema.pre('save', function (next) {
    const student = this;
    if (!student.isModified || !student.isNew) { // don't rehash if it's an old user
        next();
    } else {
        bcrypt.hash(student.password, 10, function (err, hash) {
            if (err) {
                console.log(`Error hashing password for user: ${student.firstName} ${student.lastName}`);
                next(err);
            } else {
                student.password = hash;
                next();
            }
        });
    }
});

module.exports = mongoose.model('student', StudentSchema);