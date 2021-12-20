const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const home = require('./home');

User = home.user;
Info = home.info;

router.post('/', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    console.log(req.body.content);
    const addInfo = new Info ({
        content:req.body.content,
        isPublished: true
    });
    user.infos.push(addInfo);
    user.save();
    res.send(user.email);
});

module.exports = router;