const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
    Post.find()
        .populate("postedBy")
        .sort({ "createdAt": -1 })
        .then(results => res.status(200).send(results))
        .catch(err => {
            console.log("Cannot get posts " + err);
            res.sendStatus(400);
        });
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

router.put("/:id/like", async (req, res, next) => {
    var postId = req.params.id;
    var userId = req.session.user._id;
    var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    var option = isLiked ? "$pull" : "$addToSet";

    await User.findByIdAndUpdate(userId, { [option]: { likes: postId } });
});

module.exports = router;
