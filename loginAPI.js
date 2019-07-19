        const express = require('express');
        const bcrypt = require('bcryptjs');
        const mongoose = require('mongoose');
        const app = express();

        app.use(express.json());

        // // Connection URL
        var MongoClient = require('mongodb').MongoClient;
        var db = "mongodb://localhost:27017/userDb";
        MongoClient.connect(db, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            console.log("Mongo DB Connected...!");
            //   db.close();
        });

        // User Database
        const Schema = mongoose.Schema;
        const UserSchema = new Schema({
            username: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            password: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 1024
            },
            hash: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 1024
            },
        });
        var User = mongoose.model('User', UserSchema);

        //Register New User
        app.post('/register', async (req, res) => {
            console.log('try registering : ', req.body);
            console.log(User);
            // Check if this user already exisits
            console.log('in here');
            let user = await User.findOne({ username: req.body.username });
            if (user) {
                return res.status(400).send('That user already exisits!');
            }
            // Encrypt Password
            try {
                console.log('Encrypt');
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        console.log('-----password:', hash, '& salt', salt, '-----');
                        passwordHash = hash;
                        saltHash = salt;
                        user = new User({
                            username: req.body.username,
                            password: passwordHash,
                            hash: saltHash,
                        });
                        console.log(user);
                        user.save();
                        res.send('Registered');
                    });
                });
            } catch (err) {
                console.log(err);
            }
        });

        // Login User
        app.post('/login', async (req, res) => {
            console.log('try Login : ', req.body);
            let user = await User.findOne({ username: req.body.username });
            // console.log(user);
            if (!user) {
                return res.status(400).send('Incorrect username');
            }
            console.log(user);
            console.log('decrypting entered password');

            //Decrypt Password
            const passwordHash = await bcrypt.hash(req.body.password, user.hash);
            if (passwordHash == user.password) {
                // console.log("in")
                res.send('You are logged in!');
            } else {
                console.log('incorrect password');
            }

        });

        //PORT
        const port = process.env.PORT || 3020;
        app.listen(port, () => console.log(`listening on port ${port}...`));
