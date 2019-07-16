const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("routes : posts", () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    
    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;

        Topic.create({
          title: "Winter Games",
          description: "Post your Winter Games stories.",
          posts: [{
            title: "Snowball Fighting",
            body: "So much snow!",
            userId: this.user.id
          }]
        }, {
          include: {
           model: Post,
           as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = topic.posts[0];
          done();
        })
      })
    });

  });
//////////////////////// GUEST USER ///////////////////////////////////////////
  describe("Guest user CRUD operations", () => {
    
    beforeEach((done) => {    // before each suite in this context
      const options = {
        url: "http://localhost:3000/auth/fake",
        form: { userId: 0 }
      };
      request.get(options, (err, res, body) => done());
    });

    describe("GET /topics/:topicId/posts/new", () => {

    it("should not render a new post form", (done) => {
      request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Unauthorized");
        expect(res.statusCode).toBe(401);
        done();
      });
    });

  });

  describe("POST /topics/:topicId/posts/create", () => {

    it("should not create a new post", (done) => {
       const options = {
         url: `${base}/${this.topic.id}/posts/create`,
         form: {
           title: "Papa Johns",
           body: "Without a doubt my favorite thing to do is watch paint dry!",
          }
       };
       request.post(options,
         (err, res, body) => {
 
          Post.findOne({where: {title: "Papa Johns"}})
          .then((post) => {
            expect(post).toBeNull();
            expect(res.statusCode).toBe(401);
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

    it("should not delete any post as guest", (done) => {

      expect(this.post.id).toBe(1);

      request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {


        Post.findByPk(1)
        .then((post) => {
          expect(err).toBeNull();
          expect(post).not.toBeNull();
          expect(res.statusCode).toBe(401);
          done();
        })
      });

    });

  });

  describe("GET /topics/:topicId/posts/:id/edit", () => {

    it("should not render a view with an edit post form for guests", (done) => {
      request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Unauthorized. Redirecting to /users/sign_in");
        expect(res.statusCode).toBe(401);
        done();
      });
    });

  });

  describe("POST /topics/:topicId/posts/:id/update", () => {

    it("should return a status code 401 when trying to update a post as guest", (done) => {
      request.post({
        url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
        form: {
          title: "Snowman Building Competition",
          body: "I love watching them melt slowly."
        }
      }, (err, res, body) => {
        expect(res.statusCode).toBe(401);
        done();
      });
    });

    it("should not update any post as guest", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I really enjoy the funny hats on them."
          }
        };
        request.post(options,
          (err, res, body) => {

          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(res.statusCode).toBe(401);
            expect(post.title).toBe("Snowball Fighting");
            done();
          });
        });
    });
  });
})
//////////////////////// Signed Up User ////////////////////////////////////////
  describe("Signed-In user CRUD operations", () => {

    beforeEach((done) => {    // before each suite in this context
        const options = {
          url: "http://localhost:3000/auth/fake",
          form: { userId: 1 }
        };
        request.get(options, (err, res, body) => done());
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
            title: "Papa Johns",
            body: "Without a doubt my favoriting things to do besides watching paint dry!",
            }
        };
        request.post(options,
          (err, res, body) => {
  
            Post.findOne({where: {title: "Papa Johns"}})
            .then((post) => {
              expect(post).not.toBeNull();
              expect(res.statusCode).toBe(302);
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

      it("should delete post matching userId", (done) => {

        expect(this.post.id).toBe(1);

        request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

          Post.findByPk(1)
          .then((post) => {
            expect(err).toBeNull();
            expect(post).toBeNull();
            done();
          })
        });
      });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {

      it("should render a view with an edit post form for signed in users", (done) => {
        request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Post");
          done();
        });
      });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {

      it("should return a status code 202", (done) => {
        request.post({
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I love watching them melt slowly."
          }
        }, (err, res, body) => {
          expect(res.statusCode).toBe(202);
          done();
        });
      });

      it("should update user's post as signed in user", (done) => {
        const options = {
          url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
          form: {
            title: "Snowman Building Competition",
            body: "I really enjoy the funny hats on them."
          }
        };
        request.post(options,
          (err, res, body) => {

          expect(err).toBeNull();

          Post.findOne({
            where: {id: this.post.id}
          })
          .then((post) => {
            expect(post.title).toBe("Snowman Building Competition");
            done();
          });
        });
      });
    });
  })
});