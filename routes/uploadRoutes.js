const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/UserSchema');
const session = require('express-session');
const path = require('path');

router.get("/img/:path", (req, res, next) => {
    console.log("ashu");
    res.sendFile(path.join(__dirname, "../uploads/img/" + req.params.path));
});
module.exports = router;
