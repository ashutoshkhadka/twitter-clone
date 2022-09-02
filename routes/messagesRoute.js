const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const session = require('express-session');

router.get("/", (req, res, next) => {
    var payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };
    res.status(200).render("inboxPage", payload);
});

router.get("/new", (req, res, next) => {
    var payload = {
        pageTitle: "New message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    };
    res.status(200).render("newMessage", payload);
});


module.exports = router;