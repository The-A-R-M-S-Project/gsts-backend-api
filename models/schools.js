const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SchoolSchema = new Schema(
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