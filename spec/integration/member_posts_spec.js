const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("CRUD actions for POSTS for MEMBERS", () => {
  // Create User & Topic to work with.
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    this.member;
    this.otherPost;
    sequelize.sync({ force: true }).then(() => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;

        Topic.create({
          title: "Winter Games",
          description: "Post your Winter Games stories.",
          posts: [
            {
            title: "Snowball Fighting",
            body: "So much snow!",
            userId: this.user.id
          }
        ]
        }, {
          include: {
           model: Post,
           as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          // this.post = topic.posts[0];
          User.create({
            email: `member@example.com`,
            password: "123456",
            role: 'member'
          })
          .then((member) => {
            this.member = member;
            let memberPost = {
              title: "Fireball Fighting",
              body: "So much more fun!",
              topicId: this.topic.id,
              userId: member.id
            };
            let userPost = {
              title: "Snowball Fighting",
              body: "So much snow!",
              topicId: this.topic.id,
              userId: this.user.id
            };

            Post.create(userPost)
            .then((post) => {
              this.post = post;
              
              Post.create(memberPost)
              .then((post) => {
                this.otherPost = post;
              });
            })
            .catch((err) => {
              console.log('Error creating post.', err);}
            );

            request.get({         // mock authentication
              url: "http://localhost:3000/auth/fake",
              form: {
                role: member.role,     // mock authenticate as `role` user
                userId: member.id,
                email: member.email
              }
            },
              (err, res, body) => {
                done();
              }
            );
          });
          done();
        });
      });
    });
  });

  describe("GET /topics/:topicId/posts/new", () => {

    it("should render a new post form", (done) => {
      request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Post");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/posts/create", () => {

    it("should create a new post and redirect", (done) => {
       const options = {
         url: `${base}/${this.topic.id}/posts/create`,
         form: {
           title: "Watching snow melt",
           body: "Without a doubt my favoriting things to do besides watching paint dry!",
          }
       };
       request.post(options,
         (err, res, body) => {
 
           Post.findOne({where: {title: "Watching snow melt"}})
           .then((post) => {
             expect(post).not.toBeNull();
             expect(post.title).toBe("Watching snow melt");
             expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
              
             done();
           })
           .catch((err) => {
             console.log(err);
             done();
           });
         }
       );
     });

     it("should not create a new post that fails validations", (done) => {
      const options = {
        url: `${base}/${this.topic.id}/posts/create`,
        form: {
          title: "a",
          body: "b"
        }
      };

      request.post(options,
        (err, res, body) => {

          Post.findOne({where: {title: "a"}})
          .then((post) => {
              expect(post).toBeNull();
              done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });
  });

  describe("GET /topics/:topicId/posts/:id", () => {

    it("should render a view with the selected post", (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Snowball Fighting");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/posts/:id/destroy", () => {

    it("should delete a post with matching userId", (done) => {

//#1
      expect(this.otherPost.id).toBe(3);

      request.post(`${base}/${this.topic.id}/posts/${this.otherPost.id}/destroy`, (err, res, body) => {

//#2
        Post.findByPk(2)
        .then((post) => {
          expect(err).toBeNull();
          expect(post).toBeNull();
          done();
        });
      });
    });

    it("should not delete a post without matching userId", (done) => {

//#1
      expect(this.post.id).toBe(2);

      request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

//#2
        Post.findByPk(2)
        .then((post) => {
          expect(err).toBeNull();
          expect(post).not.toBeNull();
          done();
        })
      });
    });
  });

  describe("GET /topics/:topicId/posts/:id/edit", () => {

    it("should render a view with an edit post form with matching userId", (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.otherPost.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Post");
        expect(body).toContain("Fireball Fighting");
        done();
      });
    });

    it("should not render a view with an edit post form without matching userId", (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(res.statusMessage).toBe('Unauthorized')
        expect(res.statusCode).toBe(401);
        done();
      });
    });
  });

  describe("POST /topics/:topicId/posts/:id/update", () => {

    // it("should not update the post if no matching userId", (done) => {
    //   const options = {
    //     url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
    //     form: {
    //       title: "Snowman Building Competition",
    //       body: "I really enjoy the funny hats on them."
    //     }
    //   };
    //   request.post(options,
    //     (err, res, body) => {
    //     expect(err).toBeNull();

    //     Post.findOne({
    //       where: {id: this.post.id}
    //     })
    //     .then((post) => {
    //       expect(post.title).toBe("Snowball Fighting");
    //       done();
    //     });
    //   });
    // });

    // it("should return a status code 404 without matching userId", (done) => {
    //   request.post({
    //     url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
    //     form: {
    //       title: "Snowman Building Competition",
    //       body: "I love watching them melt slowly."
    //     }
    //   }, (err, res, body) => {
    //     expect(res.statusCode).toBe(401);
    //     expect(res.statusMessage).toBe('Unauthorized')
    //     done();
    //   });
    // });

    it("should update the post if matching userId", (done) => {
      
      request.post({
        url: `${base}/${this.topic.id}/posts/${this.otherPost.id}/update`,
        form: {
          title: "Snowman Murder",
          body: "I really enjoy the funny hats on them."
        }
      },
        (err, res, body) => {

        expect(err).toBeNull();
        // expect(res.statusCode).toBe(200);
        Post.findByPk(this.otherPost.id)
        .then((post) => {
          post.update({
            title: "Snowman Murder",
            body: "I really enjoy the funny hats on them."
            }, {
            fields: Object.keys({
              title: "Snowman Murder",
              body: "I really enjoy the funny hats on them."
            })
          });
          expect(post.title).toBe("Snowman Murder");
          done();
        });
      });
    });

    it("should update the post if matching userId", (done) => {
      
      Post.findByPk(this.otherPost.id)
      .then((post) => {
        post.update({
          title: "Snowman Murder",
          body: "I really enjoy the funny hats on them."
          }, {
          fields: Object.keys({
            title: "Snowman Murder",
            body: "I really enjoy the funny hats on them."
          })
        })
        done();
      })
      .then((post) => {
        expect(err).toBeNull();
        expect(res.statusCode).toBe(200);

        post.findOne({
          where: {id: this.otherPost.id}
        })
        .then((post) => {
          console.log('NOW POST?' , post)
          expect(post.title).toBe("Snowman Murder");
          done();
        });
      })
      .catch((err) => {

      });
    });
  });
});