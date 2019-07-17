const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("Post", () => {

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
        this.user = user; //store the user

        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",
          posts: [{
            title: "My first visit to Proxima Centauri b",
            body: "I saw some rocks.",
            userId: this.user.id,
          }]
        }, {
          include: {
            model: Post,
            as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic; //store the topic
          this.post = topic.posts[0]; //store the post
          done();
        })
      })
    });
  });

  describe("#create()", () => {

    it("should create a post object with a title, body, and assigned topic", (done) => {

      Post.create({
        title: "Pros of Cryosleep during the long journey",
        body: "1. Not having to answer the 'are we there yet?' question.",
        topicId: this.topic.id,
        userId: this.user.id
      })
      .then((post) => {

        expect(post.title).toBe("Pros of Cryosleep during the long journey");
        expect(post.body).toBe("1. Not having to answer the 'are we there yet?' question.");
        expect(post.userId).toBe(this.user.id);
        done();

      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a post with missing title, body, or assigned topic", (done) => {
      Post.create({
        title: "Pros of Cryosleep during the long journey"
      })
      .then((post) => {
       // This code block should not run.
      })
      .catch((err) => {
        expect(err.message).toContain("Post.body cannot be null");
        expect(err.message).toContain("Post.topicId cannot be null");
        done();
      })
    });
  });

  describe("#setTopic()", () => {

    it("should associate a topic and a post together", (done) => {

      Topic.create({
        title: "Challenges of interstellar travel",
        description: "1. The Wi-Fi is terrible"
      })
      .then((newTopic) => {

        expect(this.post.topicId).toBe(this.topic.id);

        this.post.setTopic(newTopic)
        .then((post) => {

          expect(post.topicId).toBe(newTopic.id);
          expect(post.userId).toBe(this.user.id);
          done();

        });
      })
    });
  });

  describe("#getTopic()", () => {

    it("should return the associated topic", (done) => {

      this.post.getTopic()
      .then((associatedTopic) => {
        expect(associatedTopic.title).toBe("Expeditions to Alpha Centauri");
        done();
      });
    });
  });

  describe("#setUser()", () => {

    it("should associate a post and a user together", (done) => {

      User.create({
        email: "ada@example.com",
        password: "password"
      })
      .then((newUser) => {

        expect(this.post.userId).toBe(this.user.id);

        this.post.setUser(newUser)
        .then((post) => {

          expect(this.post.userId).toBe(newUser.id);
          done();

        });
      })
    });

  });

  describe("#getUser()", () => {

    it("should return the associated topic", (done) => {

      this.post.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      });

    });

  });

  describe("#getPoints()", () => {

    it("should return 1 when one upvote has been made", (done) => {

      // Create vote assosiated with post.
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of vote. 
        expect(vote.value).toBe(1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);

        // Call getPoints() to check number of votes.
       this.post.getPoints()
       .then((points) => {
         expect(points).toBe(1);
         done();
       })
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should return 0 when one upvote and one downvote have been made", (done) => {
      // Create downvote from this.user on post
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of downvote. 
        expect(vote.value).toBe(-1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);
        // Create second user for upvote.
        User.create({
          email: "Jaguar@FType.com",
          password: "MyDreamCar"
        })
        .then((user) => {

        // Create upvote from new user on post.
          Vote.create({
            value: 1,
            postId: this.post.id,
            userId: user.id
          })
          .then((vote) => {

            // Verify creation of vote. 
            expect(vote.value).toBe(1);
            expect(vote.postId).toBe(this.post.id);
            expect(vote.userId).toBe(user.id);

            // Call getPoints() to check number of votes.
          this.post.getPoints()
          .then((points) => {
            expect(points).toBe(0);
            done();
          })
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        })
        .catch((err) => { console.log(err); done(); })
      })
    });

    it("should return 0 when no votes are made", (done) => {
      
      // Option #1
      // const points = this.post.getPoints();
      // expect(points).toBe(0);

      // Option #2
      this.post.getPoints()
      .then((points) => {
        expect(points).toBe(0);
      })
      .catch((err) => {
        console.log(err);
      });

      // Option #3
      // expect( this.post.getPoints() ).toBe(0);
      done();
    });
  });

  describe("#hasUpvoteFor(userId)", () => {

    it("should return true when user upvoted post", (done) => {

      // Create upvote assosiated with post.
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of upvote. 
        expect(vote.value).toBe(1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);

        // Call hasUpvoteFor method passing userId
        this.post.hasUpvoteFor(this.user.id)
        .then((boolean) => {
          expect(boolean).toBe(true);
          done();
        })
        .catch((err) => { console.log(err); done(); })
       
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should return false when user has downvoted post", (done) => {

      // Create downvote assosiated with post.
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of downvote. 
        expect(vote.value).toBe(-1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);

        // Call hasUpvoteFor method passing userId
        this.post.hasUpvoteFor(this.user.id)
        .then((boolean) => {
          expect(boolean).toBe(false);
          done();
        })
        .catch((err) => { console.log(err); done(); })
       
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should return false when user has not voted on post", (done) => {

      // Call hasUpvoteFor method passing userId without creating vote
      this.post.hasUpvoteFor(this.user.id)
      .then((boolean) => {
        expect(boolean).toBe(false);
        done();
      })
      .catch((err) => { 
        console.log(err); 
        done(); 
      })
    });
  });

  describe("#hasDownvoteFor(userId)", () => {

    it("should return true when user downvoted post", (done) => {

      // Create downvote assosiated with post.
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of downvote. 
        expect(vote.value).toBe(-1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);

        // Call hasDownvoteFor method passing userId
        this.post.hasDownvoteFor(this.user.id)
        .then((boolean) => {
          expect(boolean).toBe(true);
          done();
        })
        .catch((err) => { console.log(err); done(); })
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should return false when user has upvoted post", (done) => {

      // Create upvote assosiated with post.
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {

        // Verify creation of upvote. 
        expect(vote.value).toBe(1);
        expect(vote.postId).toBe(this.post.id);
        expect(vote.userId).toBe(this.user.id);

        // Call hasDownvoteFor method passing userId
        this.post.hasDownvoteFor(this.user.id)
        .then((boolean) => {
          expect(boolean).toBe(false);
          done();
        })
        .catch((err) => { console.log(err); done(); })
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should return false when user has not voted on post", (done) => {

      // Call hasDownvoteFor method passing userId without creating vote
      this.post.hasDownvoteFor(this.user.id)
      .then((boolean) => {
        expect(boolean).toBe(false);
        done();
      })
      .catch((err) => { 
        console.log(err); 
        done(); 
      })
    });
  });
});