const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    res.status(200).render("login");
});

router.post("/", async (req, res, next) => {
    if (!req.body.content) {
        console.log("bad request: empty body");
        res.sendStatus(400);
        return;
    }

    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    };

    Post.create(postData)
        .then(async newPost => {
            newPost = await User.populate(newPost, { path: "postedBy" })
            res.status(201).send(newPost);
        })
        .catch(err => {
            console.log("Cannot create posts " + err);
            res.sendStatus(400);
        });
});

module.exports = router;
