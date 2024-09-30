const jwt = require('jsonwebtoken');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const User = require('../models/user');
const { SECRET_KEY } = require('../config');


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, resp, next) => {
    try {
        // get username and password from req.body
        const { username, password } = req.body;
        // if user authenticated
        if (await User.authenticate(username, password)) {
            // generate token
            const token = jwt.sign({ username }, SECRET_KEY);
            // update login timestamp
            await User.updateLoginTimestamp(username);
            // respond with token
            return resp.json({ token })
        } else {
            throw new ExpressError(`Invalid username or password`, 400);
        }
    } catch (err) {
        return next(err);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, resp, next) => {
    try {
        const newUser = await User.register(req.body);
        // generate token
        const token = jwt.sign({ username: newUser.username }, SECRET_KEY)
        // update timestamp
        await User.updateLoginTimestamp(newUser.username);
        return resp.json({ token });
    } catch (err) {
        return next(err);
    }
})



module.exports = router;