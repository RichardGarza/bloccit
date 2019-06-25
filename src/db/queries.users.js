const User = require("./models").User;
const bcrypt = require("bcryptjs");

module.exports = {
 
  createUser(newUser, callback){

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

// #4
console.log('USER CREATE ABOUT TO HAPPEN')
    return User.create({
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      console.log('IT HAPPENED')
      callback(null, user);
    })
    .catch((err) => {
      console.log('IT DIDN"T HAPPEN', err)
      callback(err);
    })
  }

}