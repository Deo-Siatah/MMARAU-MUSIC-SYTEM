const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    semesterId: {type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true, index: true},
    ministerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Minister', required: true, index: true},
    totalServices: {type: Number, default: 0},
    leadRoles: {type: Number, default: 0},
    backupRoles: {type: Number, default: 0},
},{timestamps: true});

module.exports = mongoose.model('Stats', statsSchema);