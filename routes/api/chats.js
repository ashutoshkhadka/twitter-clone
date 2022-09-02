const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {

    if (!req.body.users) {
        console.log("Users params not sent to API");
        res.sendStatus(400);
    }
    var users = JSON.parse(req.body.users);
    if (users.length == 0) {
        console.log("Users array is empty");
        res.sendStatus(400);
    }
    users.push(req.session.user);

    var chatData = {
        users: users,
        isGroupChat: true
    };
    Chat.create(chatData)
        .then(results => res.status(200).send(results))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

router.get("/", async (req, res, next) => {
    Chat.find({
        users: {
            $elemMatch: {
                $eq: req.session.user._id
            }
        }
    }).populate("users")
        .then(results => res.status(200).send(results))
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

module.exports = router;
