const express = require('express');
const User = require('../models/User.model');
const router = express.Router();
const saltRounds = 5;
const bcrypt = require('bcrypt');
const res = require('express/lib/response');

router.route('/signup')
.get((req, res) => {
	res.render('signup');
})
.post((req, res)=>{
	const username = req.body.username;
	let password = req.body.password;
	//const password = req.body.password;

	// Check the form is NOT empty
	if(!username || !password) res.render("signup", {errorMessage: "All fields are required"});

	User.findOne({username})
	.then(user=>{
		if(user && user.username){
			console.log("The user is: ", user);
			throw new Error("User already taken!")
		};
		
		const salt = bcrypt.genSaltSync(saltRounds);
		password = bcrypt.hashSync(password, salt);

		User.create({username, password})
		.then(()=>{res.redirect("/")})
		.catch((err)=>{
			console.log(err);
			res.redirect("/auth/signup")})
	})
	.catch((err)=>{
		res.render("signup", {errorMessage: err});
	})
});

router.route("/login")
.get((req, res) => {
  res.render("login");
})
.post((req, res)=>{
	const username = req.body.username;
	let password = req.body.password;

	if (!username || !password) {
		res.render("login", { errorMessage: "All fields are required" });
		throw new Error("Validation error");
	}

	User.findOne({username})
	.then(user=>{
		if(!user){
			throw new Error("Incorrect credentials!");
		}

		const isPwdCorrect = bcrypt.compareSync(password, user.password);
		if(isPwdCorrect){
			req.session.currentUserId = user._id;
			res.redirect("/auth/profile");
		}else{
			throw new Error("Incorrect credentials!");
		}
	})
	.catch((err)=>{
		res.render("login", {errorMessage: err});
	})
	
});


router.get('/profile', (req, res) => {
	const id = req.session.currentUserId;
	User.findById(id)
	.then((user)=>res.render("profile", user))
	.catch((err)=>console.log(err));
});

router.get("/logout", (req, res)=>{
	req.session.destroy((err)=>{
		res.redirect("/");
	});
})

module.exports = router;
