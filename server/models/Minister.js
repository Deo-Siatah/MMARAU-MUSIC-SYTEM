const mongoose = require('mongoose')

const ministerSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    gender: {type: String, required: true, enum:['male', 'female'], index: true},
    voices: {type: [String], enum: ['soprano', 'alto', 'tenor'], required: true, index: true},
    isActive: {type: Boolean, default: true,index: true}
},{timestamps: true});

module.exports = mongoose.model('Minister', ministerSchema);