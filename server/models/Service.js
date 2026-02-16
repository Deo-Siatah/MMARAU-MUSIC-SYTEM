const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    date: {type: Date, required: true},
    serviceType: {type: String, required: true, enum: ['sunday', 'saturday']},
    semesterId: {type:mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true,index: true},
    ministers: [
        {
        ministerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Minister', required: true},
        voice: {type: String, required: true, enum: ['soprano', 'alto', 'tenor']},
        role: {type: String, required: true, enum: ['lead', 'backup']},
        }
    ],
},{timestamps: true});


module.exports = mongoose.model('Service', serviceSchema);