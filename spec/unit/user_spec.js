const sequelize = require('../../src/db/models/index').sequelize;
const User = require("../../src/db/models").User;

describe('User', () => {
    beforeEach((done) => {

      sequelize.sync({force: true})
      .then(() => {
        done();
      })
      .catch((err) => {
        console.log(err); 
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
          console.log(err); 
          done();
        });
      });
      it('Should not create a user with invalid email or password', (done) => {
        User.create({
          email: "It's-a me, Mario!",
          password: "1234567890"
        })
        .then((user) => {

        })
        .catch((err) => {
          expect(err.message).toContain("Validation error: must be a valid email");
          done();
        });
      });

      it("should not create a user with an email already taken", (done) => {


            User.create({
              email: "user@example.com",
              password: "1234567890"
            })
            .then((user) => {
      
            User.create({
              email: "user@example.com",
              password: "nananananananananananananananana BATMAN!"
            })
            .then((user) => {
              // This section will be skipped due to the error.
              done();
            })
            .catch((err) => {
              expect(err.message).toContain("Validation error");
              done();
            });
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
         });
      });
   });       
});

