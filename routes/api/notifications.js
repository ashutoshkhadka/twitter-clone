const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {

    Notification.find({
        userTo: req.session.user._id,
        notificationType: {
            $ne: "newMessage"
        }
    })
        .populate("userTo")
        .populate("userFrom")
        .sort({ "createdAt": -1 })
        .then(results => {
            res.status(200).send(results);
        })
        .catch(err => {
            console.log("Cannot get notifications " + err)
            res.sendStatus(400);
        });
});

router.put("/:id/markAsOpened", (req, res, next) => {
    Notification.findByIdAndUpdate(req.params.id, { opened: true })
        .then(() => {
            res.sendStatus(204);
        })
        .catch(err => {
            console.log("Cannot get notifications " + err)
            res.sendStatus(400);
        });
});

router.put("/markAsOpened", (req, res, next) => {
    Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
        .then(() => {
            res.sendStatus(204);
        })
        .catch(err => {
            console.log("Cannot get notifications " + err)
            res.sendStatus(400);
        });
});


module.exports = router;
