const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Post", () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.altPost;
    sequelize.sync({force: true}).then((res) => {
//Create a test Topic & set it to global object property
      Topic.create({
        title: "Expeditions to Alpha Centauri",
        description: "A compilation of reports from recent visits to the star system."
      })
      .then((topic) => {
        this.topic = topic;
//Create a test Post & set it to global object property w/ assosiated
//topic set to test Topic from above.
        Post.create({
          title: "My first visit to Proxima Centauri b",
          body: "I saw some rocks.",
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("#create()", () => {
    it("should create a Topic object with a title and body", (done) => {
      Topic.create({
        title: "Test Title",
        description: "This describes the title."
      })
      .then((topic) => {
        expect(topic.title).toBe("Test Title");
        expect(topic.description).toBe("This describes the title.");
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

    it("should not create a topic with missing title or description.", (done) => {
      Topic.create({
        title: "Topic Title Pt. II"
      })
      .then((topic) => {
        ///This should be skipped since an error should be thrown from lack of description.
        done();
      })
      .catch((err) => {
        expect(err.message).toContain("Topic.description cannot be null");
        done();
      })
    });
  });

  describe("#getPosts()", () => {
    it("should return an array of post objects", (done) => {
      this.topic.getPosts()
      .then((posts) => {
        expect(posts[0].topicId).toBe(this.topic.id);
        done();
      });
    });
  });
});