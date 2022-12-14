const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const Message = require('../../schemas/MessageSchema');
const Chat = require('../../schemas/ChatSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
    if (!req.body.content || !req.body.chatId) {
        console.log("Invalid message received in the request");
        res.sendStatus(400);
    }
    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }

    Message.create(newMessage)
        .then(async message => {
            message = await message.populate("sender");
            message = await message.populate("chat");
            message = await User.populate(message, { path: "chat.users" });

            var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message }).catch(err => {
                console.log(err);
                console.log("Could not update Chat");
            });
            insertNotifications(chat, message);
            res.status(201).send(message);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(400);
        });
});

function insertNotifications(chat, message) {
    chat.users.forEach(userId => {
        if (userId == message.sender._id.toString()) {
            return;
        }
        Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
    });
}

module.exports = router;
