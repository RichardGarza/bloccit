const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/advertisements/";
const sequelize = require("../../src/db/models/index").sequelize;
const Ad = require("../../src/db/models").Advertisement;

describe("routes : ads", () => {

  beforeEach((done) => {
    this.ad;
    sequelize.sync({force: true}).then((res) => {

     Ad.create({
       title: "Google Fi Phone Service",
       description: "It's amazing and you'll love it"
     })
      .then((ad) => {
        this.ad = ad;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
  });

  describe("GET /advertisements", () => {

    it("should return a status code 200 and all ads", (done) => {

      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("Google Fi Phone Service");
        done();
      });
    });
  });

  describe("GET /advertisements/new", () => {

    it("should render a new ad form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Ad");
        done();
      });
    });

  });

  describe("POST /advertisements/create", () => {
    const options = {
      url: `${base}create`,
      form: {
        title: "Apple Phone",
        description: "This phone's better than Google's. Even the price is higher!"
      }
    };

    it("should create a new ad and redirect", (done) => {

      request.post(options,

        (err, res, body) => {
          Ad.findOne({where: {title: "Apple Phone"}})
          .then((ad) => {
            expect(res.statusCode).toBe(303);
            expect(ad.title).toBe("Apple Phone");
            expect(ad.description).toBe("This phone's better than Google's. Even the price is higher!");
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

  describe("GET /advertisements/:id", () => {

    it("should render a view with the selected ad", (done) => {
      request.get(`${base}${this.ad.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Google Fi Phone Service");
        done();
      });
    });
  });

  describe("POST /advertisements/:id/destroy", () => {

    it("should delete the ad with the associated ID", (done) => {

      Ad.all()
      .then((ads) => {
        const adCountBeforeDelete = ads.length;
        expect(adCountBeforeDelete).toBe(1);

        request.post(`${base}${this.ad.id}/destroy`, (err, res, body) => {
          Ad.all()
          .then((ads) => {
            expect(err).toBeNull();
            expect(ads.length).toBe(adCountBeforeDelete - 1);
            done();
          })
        });
      });
    });
  });

  describe("GET /advertisements/:id/edit", () => {

    it("should render a view with an edit ad form", (done) => {
      request.get(`${base}${this.ad.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit ad");
        expect(body).toContain("Google Fi Phone Service");
        done();
      });
    });

  });

  describe("POST /advertisements/:id/update", () => {

    it("should update the ad with the given values", (done) => {
      const options = {
        url: `${base}${this.ad.id}/update`,
        form: {
          title: "The Great Google LTE",
          description: "It's amazing and you'll love it"
        }
      };
//#1
      request.post(options,
        (err, res, body) => {

        expect(err).toBeNull();
//#2
        Ad.findOne({
          where: { id: this.ad.id }
        })
        .then((ad) => {
          expect(ad.title).toBe("The Great Google LTE");
          done();
        });
      });
    });
  });
});