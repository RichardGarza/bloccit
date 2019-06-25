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

          // Check this out, when running the tests, this section only partially
          // runs. 
          console.log('This will show the test is running.');
          // This console.log will run when you run the tests, but look below.
            User.create({
              email: "user@example.com",
              password: "1234567890"
            })
            .then((user) => {
          // Still running...see!
            console.log('Still running...')

            User.create({
              email: "user@example.com",
              password: "nananananananananananananananana BATMAN!"
            })
            .then((user) => {
              // This section will be skipped due to the error, (hopefully).
              console.log('This should not run');
              done();
            })
            .catch((err) => {
              // This section should run when it gets the error, right?

              console.log('This should run right?');
              // But it doesn't. And to prove this furthermore...

              expect(err.message).toContain("Validation error");
              // I duplicated the expect statement and misspelled message...
              
              expect(err.mage).toContain("Validation error");
              // and still the tests run with no errors...
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

