const sequelize = require('../../src/db/models/index').sequelize;
const User = require("../../src/db/models").User;
const userQueries = require("../../src/db/queries.users.js");

describe('User', () => {
    beforeEach((done) => {

      sequelize.sync({force: true})
      .then(() => {
        done();
      })
      .catch((err) => {
        done();});
    });
    describe('Create', () => {
      it('Should create a user object with valid email and password', (done) => {
        User.create({
          email: 'whatever@totally.com',
          password: '123456789'
        })
        .then((user) => {
          expect(user.email).toBe('whatever@totally.com');
          expect(user.id).toBe(1);
          done();
        })
        .catch((err) => {
          done();
        });
      });
      it('Should not create a user with invalid email or password', (done) => {
        User.create({
          email: "It's-a me, Mario!",
          password: "1234567890"
        })
        .then((user) => {
          // This code block should not run
        })
        .catch((err) => {
          expect(err.message).toContain("Validation error: must be a valid email");
          done();
        });
      });

      it("should not create a user with an email already taken", (done) => {
        
        let newUser = {email: 'loser@gmail.com', password: '123456', passwordConfirmation: '123456' };

        userQueries.createUser(newUser, (err, user) => {
          if(err){
            // This code block should not run
          }
          else { 
            userQueries.createUser(newUser, (err, user) => {
              if(err){
                expect(err.message).toContain("Validation error");
                done();
              } else { 
                // This code block should not run
              }
            });
          }
        });        
      });
   });       
});

