const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},

    totalWeeks: {type: Number, required: true},
    isActive: {type: Boolean, default: true}
    
},{timestamps: true});
semesterSchema.pre("validate", function() {
    if (this.startDate && this.endDate) {
        this.totalWeeks = Math.ceil(
            (this.endDate - this.startDate) / (1000 * 60 * 60 * 24 * 7)
        );
    }
});


module.exports = mongoose.model('Semester', semesterSchema);