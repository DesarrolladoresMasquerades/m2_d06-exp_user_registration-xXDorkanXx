const express = require('express');
const User = require('../models/User.model');
const router = express.Router();
const saltRounds = 5;
const bcrypt = require('bcrypt');

router.route('/signup')
.get((req, res) => {
	res.render('signup');
})
.post((req, res)=>{
	const username = req.body.username;
	let password = req.body.password;
	//const password = req.body.password;

	// Check the form is NOT empty
	if(!username || !password) res.render("signup", {errorMessage: "All filds are required"});

	User.findOne({username})
	.then(user=>{
		if(user && user.username){
			console.log("The user is: ", user);
			throw new Error("User already taken!")
		};
		
		const salt = bcrypt.genSaltSync(saltRounds);
		password = bcrypt.hashSync(password, salt);
		//const hashedPwd = bcrypt.hashSync(password, salt)

		User.create({username, password})
		//User.create({username, password: hashedPwd})
		.then(()=>{res.redirect("/")})
		.catch((err)=>{
			console.log(err);
			res.redirect("/auth/signup")})
	})
	.catch((err)=>{
		res.render("signup", {errorMessage: err});
	})
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/profile', (req, res) => {
	res.render('profile');
});

module.exports = router;
