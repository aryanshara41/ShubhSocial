const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    authorId: {
        type: String,
        require: true
    },
    authorName: {
        type: String,
        require: true
    },
    authorImage: {
        type: String,
        default: ''
    },
    text: {
        type: String,
        require: true
    }
}, { timestamps: true });

const commentModel = new mongoose.model('comment', commentSchema);
module.exports = commentModel;