let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// Virtual for genre's url
GenreSchema.virtual('url').get(function () {
  return '/catalog/genre/' + this._id;
});

// Export model
module.exports = mongoose.model('Genre', GenreSchema);
