const userQueries = require("../db/queries.users.js");
const passport = require("passport");

module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  },
  create(req, res, next){
       
       // Make newUser object from request body.
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

       // Call createuser with newUser object.
    userQueries.createUser(newUser, (err, user) => {
      
       // If there's an error, display it and redirect to sign up.
      if(err){
        req.flash("error", err);
        res.redirect("/users/sign_up");
      } else {

        // I'm having a problem right here. When passport.authenticate 
        // runs, it should set req.user to the user. I provided a 
        // success/failure redirect and while it directs me to 
        // the successful route, the req.user remains undefined.
        
        passport.authenticate("local", { successRedirect: '/',
        failureRedirect: '/login' })(req, res, () => {
          console.log(req.user,'req.user');
          req.flash("notice", "You've successfully signed in!");
          
          res.redirect("/");
        });
      }
    });
  },
  signInForm(req, res, next){
    res.render("users/sign_in");
  },

  signIn(req, res, next){
    passport.authenticate("local")(req, res, () => {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.")
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    });
  },
  
  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  }
};