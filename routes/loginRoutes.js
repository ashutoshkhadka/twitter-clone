const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const session = require('express-session');

app.set("view engine", "pug");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    res.status(200).render("login");
});

router.post("/", async (req, res, next) => {
    var payload = req.body
    if (req.body.username && req.body.password) {
        var user = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        })
        if (user != null) {
            var passwordMatches = await bcrypt.compare(req.body.password, user.password);
            if (passwordMatches === true) {
                req.session.user = user;
                return res.redirect("/");
            }
        }
        payload.errorMessage = "Login credentials incorrect";
        res.status(200).render("login", payload);
    }
    payload.errorMessage = "Make sure each field has a valid value";
    res.status(200).render("login");
});

module.exports = router;
