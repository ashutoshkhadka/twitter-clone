const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));


router.put("/:userId/follow", async (req, res, next) => {
    var userId = req.params.userId;
    var user = await User.findById(userId);

    if (user == null) {
        return res.sendStatus(404);
    }

    // Are we following the user ??? 
    var userFollowers = user.followers;
    var currentSessionUserId = req.session.user._id;
    var isFollowing = userFollowers && userFollowers.includes(currentSessionUserId);
    var option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(currentSessionUserId,
        { [option]: { following: userId } },
        { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })

    User.findByIdAndUpdate(userId,
        { [option]: { followers: currentSessionUserId } },
        { new: true })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        })



    res.status(200).send(req.session.user);
});

router.get("/:userId/following", async (req, res, next) => {
    var userId = req.params.userId;
    await User.findById(userId)
    .populate("following")
        .then(results =>
            res.status(200).send(results)
            )
            .catch(err =>{
                console.log(err);
                res.sendStatus(400);
            });
});

router.get("/:userId/followers", async (req, res, next) => {
    var userId = req.params.userId;
    await User.findById(userId)
    .populate("followers")
        .then(results =>
            res.status(200).send(results)
            )
            .catch(err =>{
                console.log(err);
                res.sendStatus(400);
            });
});

module.exports = router;