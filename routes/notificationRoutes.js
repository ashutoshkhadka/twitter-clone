const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const session = require('express-session');

router.get("/", (req, res, next) => {
    res.status(200).render("notificationPage", {
        pageTitle: "Search",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    })
});


module.exports = router;
