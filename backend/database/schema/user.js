const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        require: true
    },
    email: {
        type : String,
        require: true,
        unique: true
    },
    password:{
        type : String,
        require: true
    },
    profilePic:{
        type : String,
        default: ''
    },
    friends:{
        type : Array,
        default: []
    },
    friendRequests:{
        type : Array,
        default: []
    },
    posts:{
        type : Array,
        default: []
    },
    chatPeople:{
        type: Array,
        default: []
    },
    chats:{
        type: Object, // store the chats in the form of map where key will be it of the user 
        default: {}
    }
}, { timestamps: true });

const userModel = new mongoose.model('users', userSchema );

module.exports = userModel;

// only want the people with whom the user has done chat
// when click on the name of any person then load the chats that has been done between user and person 

// {
//     "12321321321": {
//          {
//              message: "Hello how are you?"
//              sender: true/false => true if the user has send the message
//                                 => false if the user has not send the message
//          }            
//     },
//     "35235252353": {
//         "chatswith": [id1, id2, id3, id4]
//     }
// }