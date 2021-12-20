const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const home = require('./routes/home');
const regis = require('./routes/registry');
const comment = require('./routes/comment');
const app = express();

if(!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not defined!');
    process.exit(1);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/', home.router);
app.use('/regis', regis);
app.use('/comment', comment);

mongoose.connect('mongodb://localhost/prj')
    .then( () => console.log('Connected to MongoDB...'))
    .catch( err => console.error('Could not connect to MongoDB...', err));

const port = process.env.PORT || 3000;
app.listen( 3000, () => console.log('Listening on port', port) );