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
    if(req.session){
        req.session.destroy(()=>{
            res.redirect("login");
        })
    }
    res.status(200).render("home");
});

module.exports = router;
