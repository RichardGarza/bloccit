const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const User = require("../../src/db/models").User;
const Favorite = require("../../src/db/models").Favorite;

describe('Favorite posts', () => {
  
  beforeEach((done) => {
    
       this.user;
       this.topic;
       this.post;
       this.favorite;
    
       
       sequelize.sync({force: true}).then((res) => {
    
         User.create({
           email: "starman@tesla.com",
           password: "Trekkie4lyfe"
         })
         .then((res) => {
           this.user = res;
    
           Topic.create({
             title: "Expeditions to Alpha Centauri",
             description: "A compilation of reports from recent visits to the star system.",
             posts: [{
               title: "My first visit to Proxima Centauri b",
               body: "I saw some rocks.",
               userId: this.user.id
             }]
           }, {
             include: {
               model: Post,
               as: "posts"
             }
           })
           .then((res) => {
             this.topic = res;
             this.post = this.topic.posts[0];
    
             Comment.create({
               body: "ay caramba!!!!!",
               userId: this.user.id,
               postId: this.post.id
             })
             .then((res) => {
               this.comment = res;
               done();
             })
             .catch((err) => {
               console.log(err, '1');
               done();
             });
           })
           .catch((err) => {
             console.log(err, '2');
             done();
           });
         });
       });
     });
    

  describe('Create!', () => {

    it('Should create a favorite for a valid user & post', () => {

      Favorite.create({
        userId: this.user.id,
        postId: this.post.id
      })
      .then((favorite) => {
        expect(favorite.userId).toBe(this.user.id);
        expect(favorite.postId).toBe(this.post.id);
      })
      .catch((err) => { console.log(err, '3'); })
    })

    it('Should not create a favorite without valid userId', () => {

      Favorite.create({
        userId: null,
        postId: this.post.id
      })
      .then((favorite) => {
        // This code block should not execute
      })
      .catch((err) => { 
        expect(err.message).toContain("Favorite.userId cannot be null");
      })
    })

    it('Should not create a favorite without valid postId', () => {

      Favorite.create({
        userId: this.user.id,
        postId: null
      })
      .then((favorite) => {
        // This code block should not execute
      })
      .catch((err) => { 
        expect(err.message).toContain("Favorite.postId cannot be null");
      })
    })
  }); // End Create

  describe("setUser()", () => {

    it("should associate a favorite and a user together", (done) => {

      Favorite.create({           
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        this.favorite = favorite;     
        expect(favorite.userId).toBe(this.user.id);

        User.create({                 
          email: "machete@trejoDanny.com",
          password: "pincheCabron"
        })
        .then((newUser) => {

          this.favorite.setUser(newUser)  
          .then((favorite) => {

            expect(favorite.userId).toBe(newUser.id); 
            done();

          });
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      })
    });

  }); // End setUser

  describe('getUser!', () => {

    it('Should return assosiated user when called on favorite', (done) => {

      Favorite.create({
        userId: this.user.id,
        postId: this.post.id
      })
      .then((favorite) => {
        expect(favorite.userId).toBe(this.user.id);

        favorite.getUser()
        .then((user) => {
          expect(user.id).toBe(this.user.id);
          done();
        })
        .catch((err) => { console.log(err, '7'); })
      })
      .catch((err) => { console.log(err, '8'); })
    })
  }); // End getUser

  describe("setPost()", () => {

    it("should associate a post and a favorite together", (done) => {

      Favorite.create({           
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        this.favorite = favorite;     

        Post.create({         
          title: "Dress code on Proxima b",
          body: "Guys, shirts are required. Girls, shirts are optional",
          topicId: this.topic.id,
          userId: this.user.id
        })
        .then((newPost) => {

          expect(this.favorite.postId).toBe(this.post.id); 

          this.favorite.setPost(newPost)             
          .then((favorite) => {

            expect(favorite.postId).toBe(newPost.id);
            done();

          });
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

  }); // End setPost

  describe('getPost!', () => {

    it('Should return assosiated post when called on favorite', () => {

      Favorite.create({
        userId: this.user.id,
        postId: this.post.id
      })
      .then((favorite) => {
        expect(favorite.postId).toBe(this.post.id);

        favorite.getPost()
        .then((post) => {
          expect(post.id).toBe(this.post.id);
        })
        .catch((err) => { console.log(err, '12'); })
      })
      .catch((err) => { console.log(err, '13'); })
    })
  }); // End getPost
});