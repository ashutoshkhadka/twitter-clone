const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Chat = require('../schemas/ChatSchema');
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

router.get("/:chatId", async (req, res, next) => {
    var userId = req.session.user._id;
    var chatId = req.params.chatId;
    var payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };

    if (!mongoose.isValidObjectId(chatId)) {
        payload.errorMessage = "Chat does not exist or you do not have the permission to view it";
        res.status(200).render("chatPage", payload);
        return;
    }

    var chat = await Chat.findOne({
        _id: chatId,
        users: {
            $elemMatch: {
                $eq: userId
            }
        }
    }).populate("users");

    if (chat == null) {
        var userFound = await User.findById(chatId);
        if (userFound != null) {
            chat = await getChatByUserId(userFound._id, userId);
        }
    }

    if (chat == null) {
        payload.errorMessage = "Chat does not exist or you do not have the permission to view it";
    } else {
        payload.chat = chat;
    }

    res.status(200).render("chatPage", payload);
});

function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {
                    $elemMatch: {
                        $eq: mongoose.Types.ObjectId(userLoggedInId)
                    }
                },
                {
                    $elemMatch: {
                        $eq: mongoose.Types.ObjectId(otherUserId)
                    }
                }
            ],
        }
    }, {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    }, {
        new: true,
        upsert: true
    })
        .populate("users")
        .catch(err => {
            console.log("Cannot create chat " + err);
            res.sendStatus(400);
        });
}

module.exports = router;
