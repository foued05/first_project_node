const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const home = require('./home');
const router = express.Router();

User = home.user;

router.post('/', async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().min(5).required(),
        password: Joi.string().min(5).required(),
        name: Joi.string().min(2).required()
    });
    const {error, value} = schema.validate(req.body);
    if(error){
        res.status(400).send(error);
        return;
    }

    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('User already registred');

    user = new User(_.pick(req.body, ['name', 'email', 'password'] ));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(user);
});

module.exports = router;