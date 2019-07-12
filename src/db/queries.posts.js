const Post = require("./models").Post;
const Topic = require("./models").Topic;
const Authorizer = require("../policies/post");
const Comment = require("./models").Comment;
const User = require("./models").User;

module.exports = {

  addPost(newPost, callback){
    return Post.create(newPost)
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getPost(id, callback){
    return Post.findByPk(id, {
      include: [
        {model: Comment, as: "comments", include: [
          {model: User }
        ]}
      ]
    })
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    })
  },

  deletePost(req, callback){
    return Post.findByPk(req.params.id)
    .then((post) => {
      const authorized = new Authorizer(req.user, post).destroy();

      if (authorized){

        Post.destroy({
          where: { id: req.params.id }
        })
        .then((deletedRecordsCount) => {
          callback(null, deletedRecordsCount);
        })
        .catch((err) => {
          callback(err);
        })
      } else {
        callback("NOT AUTHORIZED");
      }
    })
  },

  updatePost(body, req, callback){
    return Post.findByPk(req.params.id).then( post => {
      if(!post){
        callback(err);
      } else {
        const authorized = new Authorizer(req.user, post).update();

        if(authorized){
          post.update(body, { fields: Object.keys(body)})
          .then((post) => {
            callback(null, post);
          });
        } else {
          callback('UNAUTHORIZED')
        }
      }
    })
   .catch((err) => {
     callback(err);
   });
  }
}