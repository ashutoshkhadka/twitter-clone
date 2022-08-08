const mongoose = require('mongoose');

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb+srv://admin:nimda@cluster0.ytwp5vr.mongodb.net/?retryWrites=true&w=majority")
            .then(() => {
                console.log("db connection successful");
            })
            .catch((err) => {
                console.log("ERROR: db connection unsuccessful" + err);
            })

    }
}

module.exports = new Database();