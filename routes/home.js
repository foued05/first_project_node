const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../middleware/auth');
const router = express.Router();

const infoSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    date: { type: Date, default: Date.now },
    isPublished: Boolean
})
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255
    },
    infos: [infoSchema],
    date: { type: Date, default: Date.now },
    isPublished: Boolean
});
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id}, config.get('jwtPrivateKey'));
    return token;
};
const User = mongoose.model('User', userSchema);
const Info = mongoose.model('Info', infoSchema);

async function createUser(info){
    const user = new User({
        email: 'amamiwafa90@gmail.com',
        password: '123456789',
        name: 'Wafa',
        infos:info,
        isPublished: true
    });
    const result = await user.save();
    console.log(result);
}
async function createInfo(){
    const info = new Info({
        content:'Hello',
        isPublished: true
    })
}
// createUser(new Info({ content:'Hello', isPublished: true}));

router.get('/',auth, async (req, res) => {
    const users = await User
    .find({ infos: { $ne: [] } })
    .select({ infos: 1, name: 1 });
    res.send(users);
});

router.post('/', async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().min(5).required(),
        password: Joi.string().min(5).required()
    });
    const {error, value} = schema.validate(req.body);
    if(error){
        res.status(400).send(error);
        return;
    }

    let user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Invalid email or password!');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();
    
    res.send(token);
});

module.exports.router = router;
module.exports.user = User;
module.exports.info = Info;