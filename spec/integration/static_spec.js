const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";
const about = "http://localhost:3000/about";

describe("routes : static", () => {

//#1
  describe("GET /", () => {

//#2
it("should return status code 200 and have 'Welcome to Bloccit' in the body of the response", (done) => {

//#3
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toContain("Welcome to Bloccit");

//#4
        done();
      });
    });

  });
  describe("GET /about ", () => {

    //#2
    it("should return status code 200 and have 'About Us.' in the body of the response", (done) => {
    
    //#3
          request.get(about, (err, res, body) => {
            expect(res.statusCode).toBe(200);
            expect(body).toContain("About Us.");
    
    //#4
            done();
          });
        });
    
      });
});