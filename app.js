const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
require('dotenv').config();

const app = express();

// Middleware
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


//Database Connection
mongoose.connect("mongodb+srv://admin-miguel:Myfirstlivewebsite123101@cluster0.y2w8m.mongodb.net/ofitnessDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

//Ofitness Database Schema 
const ofitnessSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
});

//Setting up Passport local mongoose Plugin does hashing and salting
ofitnessSchema.plugin(passportLocalMongoose);

//Ofitness Model 
const User = new mongoose.model("User", ofitnessSchema);

//Passport 
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Routes    
app.get("/", function (req, res){
    res.render("home");
});
app.get("/login",function (req, res){
    res.render("login");
});
app.get("/registration", function (req, res){
    res.render("registration");
});

app.get("/user", function (req, res)
{    
    if (req.isAuthenticated()) {
        res.render("user", { name: req.user.firstName });
    } else {
        res.redirect("/login");
    }
});

app.get("/mealplan", function (req, res){
    if (req.isAuthenticated()) {
        res.render("mealplan", { name: req.user.firstName });
    } else {
        res.redirect("/login");
    }
});
app.get("/workouts",function (req, res){
    if (req.isAuthenticated()) {
        res.render("workouts", { name: req.user.firstName });
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    //passport function
    req.logout();
    res.redirect("/login")
})

//passport local mongoose 
app.post("/registration", function (req, res) {
    User.register({
        username: req.body.username,
        firstName: req.body.fname,
        lastName: req.body.lname}, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/registration");
        } else {
            passport.authenticate("local")(req, res, function ()
            {
                res.redirect("/user");
            });
        }
    });
});

app.post("/login", function (req, res)
{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    // passport login function 
    req.login(user, function (err)
    {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function ()
            {
                res.redirect("/user");
            });
        }
    });
});

app.listen(3000, function (){
    console.log("Server started on port 3000.");
});