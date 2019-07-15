'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {});
  Post.associate = function(models) {
    // associations can be defined here
    Post.belongsTo(models.Topic, {
      foreignKey: "topicId",
      onDelete: "CASCADE"
    });
    Post.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
    Post.hasMany(models.Comment, {
      foreignKey: "postId",
      as: "comments"
    });
    Post.hasMany(models.Vote, {
      foreignKey: "postId",
      as: "votes"
    });
  };

  Post.prototype.getPoints = function(){
    const Vote = require('../models').Vote;

    return Vote.findAll({ where: { postId : this.id } })
    .then((votes) => { 
      return votes
      .map((v) => { return v.value })
      .reduce((prev, next) => { return prev + next });
    })
    .catch((err) => { return 0})
  };

  Post.prototype.hasUpvoteFor = function(userId){
    const Vote = require('../models').Vote;

    return Vote.findOne({ where : { userId } })
    .then((vote) => {
      if(vote.value === 1){
       return true 
      } else {
        return false
      }
    })
    .catch((err) => { return false });
  };

  Post.prototype.hasDownvoteFor = function(userId){
    const Vote = require('../models').Vote;

    return Vote.findOne({ where : { userId } })
    .then((vote) => {
      if(vote.value === -1){
       return true 
      } else {
        return false
      }
    })
    .catch((err) => { return false });
  };

  return Post;
};