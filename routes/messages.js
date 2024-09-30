const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const Message = require('../models/message');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async (req, resp, next) => {
    try {
        const message = await Message.get(req.params.id);
        // ensure logged in user is either sender or recipient
        if (req.user.username !== message.from_user.username &&
            req.user.username !== message.to_user.username) {
            throw new ExpressError(`You are not authorized to view this message`, 401);
        } return resp.json({ message });
    } catch (err) {
        return next(err);
    }
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req, resp, next) => {
    try {
        let { to_username, body } = req.body;
        const message = await Message.create({
            from_username: req.user.username,
            to_username,
            body
        });
        return resp.json({ message });

    } catch (err) {
        return next(err);
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, resp, next) => {
    try {
        // get message first
        const message = await Message.get(req.params.id);
        // ensure logged in user is the recipient of message
        if (req.user.usernae !== message.to_user.username) {
            throw new ExpressError(`You are not authorized to mark as read`, 401);
        }
        // mark as read
        const readMsg = await Message.markRead(req.params.id);
        return resp.json({ message: readMsg });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;