const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    // hash the password
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // save the user in the database
            user.save()
                .then(() => res.status(201).json({ message: 'User created!' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    // find the user by email
    User.findOne({ email: req.body.email })
        // if the user exists, we check the password
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User not found!'});
            }
            // compare the password
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        // if the password is incorrect, we return an error
                        return res.status(401).json({ error: 'Incorrect password!'});
                    }
                    // if the password is correct, we return a token
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.TOKEN,
                            { expiresIn: '24h' }                            
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
};