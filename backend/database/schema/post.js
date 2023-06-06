const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    authorId: {
        type: String,
        require: true
    },
    authorName:{
        type: String,
        require: true
    },
    textMessage: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    numberOfLikes: {
        type: Number,
        default: 0
    },
    numberOfComments: {
        type: Number,
        default: 0
    },
    comments: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    }
}, { timestamps: true });

const userModel = new mongoose.model('posts', postSchema);

module.exports = userModel;