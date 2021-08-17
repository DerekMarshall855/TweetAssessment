import supertest from 'supertest';
import should from 'should';

let server = supertest.agent("http://localhost:5000");

/*
    User unit test currently deletes all of the DB and leaves you with one user for further testing
    Username: TestUser
    Password: 123
*/

describe("GET /badlink", () => {
    it("Should return 404", (done) => {
        server
        .get("/invalid")
        .expect(404)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(404);
            done();
        });
    });
});

describe("GET /", () => { 
    it("Should return \'Server is ready\'", (done) => {
        server.get("/")
        .expect("Content-type", "text/html; charset=utf-8")
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            done();
        });
    });
});

describe("DELETE /api/user", () => {
    it("Should delete all users from DB to prep for tests; return: success: true, message: All users have been deleted", (done) =>{
        server.delete("/api/user/removeAll")
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.message.should.equal("All users have been deleted")
            res.body.success.should.equal(true);
            done();
        });
    });
});

describe("POST /api/user", () => {  // Returns status and success or fail + reason
    //Register success and errors
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser",
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.should.have.property('_id');
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser");
            done();
        });
    });

    it("Should return success: false, err: user E11000 duplicate key...", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser",
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(401)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.err.should.equal("E11000 duplicate key error collection: leapgrad_twitter.users index: name_1 dup key: { name: \"TestUser\" }");
            done();
        });
    });

    //Signin success and errors
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/signin")
        .send({
            "name": "TestUser",
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.should.have.property('_id');
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser");
            done();
        });
    });

    it("Should return success: false, message: Invalid Username", (done) => {
        server.post("/api/user/signin")
        .send({
            "name": "DoesntExist",
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(401)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.message.should.equal("Invalid Username");
            done();
        });
    });

    it("Should return success: false, message: Invalid Password", (done) => {
        server.post("/api/user/signin")
        .send({
            "name": "TestUser",
            "password": "InvalidPassword"
        })
        .expect("Content-type", /json/)
        .expect(401)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.message.should.equal("Invalid Password");
            done();
        });
    });

    it("Should return success: false, message: Missing Username or Password", (done) => {
        server.post("/api/user/signin")
        .send({
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(400)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(400);
            res.body.success.should.equal(false);
            res.body.message.should.equal("Missing Username or Password");
            done();
        });
    });

    it("Should return success: false, message: Missing Username or Password", (done) => {
        server.post("/api/user/signin")
        .send({
            "username": "Derek"
        })
        .expect("Content-type", /json/)
        .expect(400)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(400);
            res.body.success.should.equal(false);
            res.body.message.should.equal("Missing Username or Password");
            done();
        });
    });
    it("Should return success: false, message: Missing Username or Password", (done) => {
        server.post("/api/user/signin")
        .send({})
        .expect("Content-type", /json/)
        .expect(400)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(400);
            res.body.success.should.equal(false);
            res.body.message.should.equal("Missing Username or Password");
            done();
        });
    });
});