var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var HowSchema   = new Schema({
    title: String,
    image_icon: String,
    steps: [{
    	step_number: Number,
    	title: String,
    	image: String,
    	description: String
    }],
    upvotes: Number
});

HowSchema.index({title:'text'});

module.exports = mongoose.model('How', HowSchema);