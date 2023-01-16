const mongoose = require('mongoose');

// Mongoose Sauce schema
const sauceSchema = mongoose.Schema({
    userId : {type: String, required: true},
    name: {type: String, required: true},
    manufacturer : {type: String, required: false},
    description: {type: String, required: false},
    mainPepper : {type: String, required: false},
    imageUrl: {type: String, required: false},
    heat : {type: Number, required: true},
    likes: {type: Number, required: false},
    dislikes : {type: Number, required: false},
    usersLiked: {type: Array, required: false},
    usersDisliked : {type: Array, required: false}
});

module.exports = mongoose.model("Sauce", sauceSchema);