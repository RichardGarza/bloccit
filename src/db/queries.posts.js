const Post = require("./models").Post;
const Topic = require("./models").Topic;
const Authorizer = require("../policies/post");


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
    return Post.findByPk(id)
    .then((post) => {
      callback(null, post);
    })
    .catch((err) => {
      callback(err);
    })
  },

  deletePost(id, callback){
    return Post.destroy({
      where: { id }
    })
    .then((deletedRecordsCount) => {
      callback(null, deletedRecordsCount);
    })
    .catch((err) => {
      callback(err);
    })
  },

  updatePost(post, req, callback){

   return Post.findByPk(req.params.id).then( post => {

    if(!post){
      callback(err);
    } else {
      post.update(post, { fields: Object.keys(post)})
      .then(() => {
        callback(null, post);
      });
    }
   })
   .catch((err) => {
     callback(err);
   });
  }
}