const Flair = require("./models").Flair;

module.exports = {

  createFlair(newFlair, callback) {
    return Flair.create(newFlair)
      .then(flair => {
        callback(null, flair);
      })
      .catch(err => {
        console.log('ERROR' , err)
        callback(err);
      });
  },

  getFlair(id, callback) {
    return Flair.findByPk(id)
      .then(flair => {
        callback(null, flair);
      })
      .catch(err => {
        callback(err);
      });
  },
  
  updateFlair(id, updatedFlair, callback) {
    return Flair.findByPk(id)
    .then(flair => {
      if (!flair) {
        return callback("Flair not found");
      }
      flair.update( updatedFlair, { fields: Object.keys(updatedFlair) })
      .then(() => {
        callback(null, flair);
      })
      .catch(err => {
        callback(err);
      });
    });
  },

  deleteFlair(id, callback) {
    return Flair.destroy({
      where: { id }
    })
      .then(deletedRecordsCount => {
        callback(null, deletedRecordsCount);
      })
      .catch(err => {
        callback(err);
      });
  }
};