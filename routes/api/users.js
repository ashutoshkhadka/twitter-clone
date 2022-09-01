const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const multer = require('multer');
const upload = multer({ dest: "uploads/" });
const path = require('path');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));


router.get("/", async (req, res, next) => {
    var searchObj = req.query;

    if (searchObj.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: searchObj.search, $options: "i" } },
                { lastName: { $regex: searchObj.search, $options: "i" } },
                { username: { $regex: searchObj.search, $options: "i" } }
            ]
        }

        User.find(searchObj)
            .then(results => res.status(200).send(results))
            .catch(err => {
                console.log("Cannot search users " + err);
                res.sendStatus(400);
            })
        delete searchObj.search;
    }

});

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
        .catch(err => {
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
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    console.log("image uploading...");
    if (!req.file) {
        console.log("NO file uploaded with AJAX request");
        return res.sendStatus(404);
    }

    var filePath = `/uploads/img/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);



    fs.rename(tempPath, targetPath, async err => {
        if (err != null) {
            console.log(err);
            return res.sendStatus(400);
        }
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true });
        res.sendStatus(204);
    });

});

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    console.log("image uploading...");
    if (!req.file) {
        console.log("NO file uploaded with AJAX request");
        return res.sendStatus(404);
    }

    var filePath = `/uploads/img/${req.file.filename}.png`;
    var tempPath = req.file.path;
    var targetPath = path.join(__dirname, `../../${filePath}`);



    fs.rename(tempPath, targetPath, async err => {
        if (err != null) {
            console.log(err);
            return res.sendStatus(400);
        }
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true });
        res.sendStatus(204);
    });

});


module.exports = router;