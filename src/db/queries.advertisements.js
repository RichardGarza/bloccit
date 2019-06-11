const Ad = require("./models").Advertisement;

module.exports = {

//#1
getAllAdvertisements(callback){
    return Ad.all()

//#2
    .then((ads) => {
      callback(null, ads);
    })
    .catch((err) => {
      callback(err);
    })
  },

  addAdvertisement(newAd, callback){
    return Ad.create({
      title: newAd.title,
      description: newAd.description
    })
    .then((ad) => {
      callback(null, ad);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getAdvertisement(id, callback){
    return Ad.findById(id)
    .then((ad) => {
      callback(null, ad);
    })
    .catch((err) => {
      callback(err);
    })
  },

  deleteAdvertisement(id, callback){
    return Ad.destroy({
      where: {id}
    })
    .then((ad) => {
      callback(null, ad);
    })
    .catch((err) => {
      callback(err);
    })
  },

  updateAdvertisement(id, updatedAd, callback){
    return Ad.findById(id)
    .then((ad) => {
      if(!ad){
        return callback("Ad not found");
      }

      ad.update(updatedAd, {
        fields: Object.keys(updatedAd)
      })

      .then(() => {
        callback(null, ad);
      })
      .catch((err) => {
        callback(err);
      });
    });
  }
}