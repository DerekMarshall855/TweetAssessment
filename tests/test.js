import supertest from 'supertest';
import should from 'should';

let server = supertest.agent("http://localhost:5000");

/*
    User unit test currently deletes all of the DB and leaves you with one user for further testing
    Username: TestUser
    Password: 123
*/

let t1_id = "";
let t2_id = "";

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

describe("DELETEALL /api/user", () => {
    it("Should delete all users from DB to prep for tests; return: success: true, message: All users have been deleted", (done) =>{
        server.delete("/api/user/remove/all")
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

describe("POST/AUTH Routes /api/user", () => {  // Returns status and success or fail + reason
    //Register success and errors
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser1",
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
            t1_id = res.body._id;  // Assign to global var for later int tests
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser1");
            done();
        });
    });

    it("Should return 406 success: false, error: Username and Password must not contain spaces", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "Test User 1",
            "password": "123"
        })
        .expect("Content-type", /json/)
        .expect(406)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Username and Password must not contain spaces");
            done();
        });
    });

    it("Should return 406 success: false, error: Username and Password must not contain spaces", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser1",
            "password": "1 2 3"
        })
        .expect("Content-type", /json/)
        .expect(406)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Username and Password must not contain spaces");
            done();
        });
    });

    //Register 2nd account for update testing
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser2",
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
            t2_id = res.body._id;
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser2");
            done();
        });
    });

    // Also throws server error, doesnt lead to complete crash though
    it("Should return success: false, err: user E11000 duplicate key...", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser1",
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
            res.body.err.should.equal("E11000 duplicate key error collection: leapgrad_twitter.users index: name_1 dup key: { name: \"TestUser1\" }");
            done();
        });
    });

    //Signin success and errors
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/signin")
        .send({
            "name": "TestUser1",
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
            res.body.name.should.equal("TestUser1");
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
            "name": "TestUser1",
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
            "username": "TestUser1"
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

describe("UPDATE /api/user/:id", () => {
    it("Should return 401 success: false, error: You can only update your own account", (done) => {
        server
        .put(`/api/user/${t1_id}`)
        .send({"_id": `${t2_id}`})
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You can only update your own account");
            done();
        });
    });

    it("Should return 406 success: false, error: Username must not contain spaces", (done) => {
        server
        .put(`/api/user/${t1_id}`)
        .send({"_id": `${t1_id}`, "name": "Test User"})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Username must not contain spaces");
            done();
        });
    });

    it("Should return 406 success: false, error: Password must not contain spaces", (done) => {
        server
        .put(`/api/user/${t1_id}`)
        .send({"_id": `${t1_id}`, "name": "TestUser", "password": "1 2 3"})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Password must not contain spaces");
            done();
        });
    });

    it("Should return 200 success: true, message: User successfully updated", (done) => {
        server
        .put(`/api/user/${t1_id}`)
        .send({"_id": `${t1_id}`, "name": "TestUser", "password": "1234"})
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("User successfully updated");
            done();
        });
    });

    it("Should return success: true, _id, name, token (Test if new pass and name work)", (done) => {
        server.post("/api/user/signin")
        .send({
            "name": "TestUser",
            "password": "1234"
        })
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.should.have.property('_id');
            t1_id = res.body._id;
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser");
            done();
        });
    });

    it("Should return 401, success: false, error: You cannot follow yourself", (done) => {
        server
        .put(`/api/user/follow/${t1_id}`)
        .send({"_id": `${t1_id}`})
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You cannot follow yourself");
            done();
        });
    });
    it("Should return 200, success: true, message: User successfully followed", (done) => {
        server
        .put(`/api/user/follow/${t2_id}`)
        .send({"_id": `${t1_id}`})
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("User successfully followed");
            done();
        });
    });
    it("Should return 403, success: false, error: You already follow this user", (done) => {
        server
        .put(`/api/user/follow/${t2_id}`)
        .send({"_id": `${t1_id}`})
        .expect(403)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(403);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You already follow this user");
            done();
        });
    });
    it("Should return 401, success: false, error: You cannot unfollow yourself", (done) => {
        server
        .put(`/api/user/unfollow/${t1_id}`)
        .send({"_id": `${t1_id}`})
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You cannot unfollow yourself");
            done();
        });
    });
    it("Should return 200, success: true, message: User successfully unfollowed", (done) => {
        server
        .put(`/api/user/unfollow/${t2_id}`)
        .send({"_id": `${t1_id}`})
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("User successfully unfollowed");
            done();
        });
    });
    it("Should return 403, success: false, error: You don't follow this user", (done) => {
        server
        .put(`/api/user/unfollow/${t2_id}`)
        .send({"_id": `${t1_id}`})
        .expect(403)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(403);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You don't follow this user");
            done();
        });
    });
});

describe("DELETE /api/user/:id", () => {
    it("Should return 401 success: false, error: You can only delete your own account", (done) => {
        server
        .delete(`/api/user/${t1_id}`)
        .send({"_id": `${t2_id}`})
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You can only delete your own account");
            done();
        });
    });

    it("Should return 200 success: true, message: Account has been deleted", (done) => {
        server
        .delete(`/api/user/${t2_id}`)
        .send({"_id": `${t2_id}`})
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("Account has been deleted");
            done();
        });
    });
});

describe("GET /api/user/:id", () => {
    // Mocha cant handle error code 500, but trust me it does crash
    // it("Should return 500 success: false, error: err", (done) => {
    //     server
    //     .get(`/api/user/${t2_id}`)
    //     .expect(500)
    //     .end(function(err,res){
    //         if (err) {
    //             done(err);
    //         }
    //         res.status.should.equal(500);
    //         res.body.success.should.equal(false);
    //         res.body.should.have.property('error');
    //         done();
    //     });
    // });

    it("Should return 200 success: true, message: accountInfo - password", (done) => {
        server
        .get(`/api/user/${t1_id}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.have.property("name");
            res.body.message.should.have.property("_id");
            res.body.message.name.should.equal("TestUser");
            done();
        });
    });
});