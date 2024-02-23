const mongoose = require('mongoose'); 

const courseSchema = new mongoose.Schema({
    code: String,
    description: String,
    units: Number,
    tags: String
  });
  const courses = mongoose.model('courses', courseSchema); 


module.exports = courses;