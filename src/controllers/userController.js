const userQueries = require("../db/queries.users.js");
const passport = require("passport");

module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  },
  create(req, res, next){
       
       // Make newUser object from request body.
       newUser = {
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
        passport.authenticate("local", { successRedirect: '/',
        failureRedirect: '/sign_up' })(req, res, () => {
          req.flash("notice", "You've successfully signed up, and you're signed in!");
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
  },

  show(req, res, next){
    userQueries.getUser(req.params.id, (err, result) => {

      if(err || result.user === undefined){
        req.flash("notice", "No user found with that ID.");
        res.redirect("/");
      } else {
        res.render("users/show", {...result});
      }
    });
  }
};