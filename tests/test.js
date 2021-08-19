import supertest from 'supertest';
import should from 'should';

let server = supertest.agent("http://localhost:5000");

/*
    USER API TESTING
    ----------------
*/

let t1_id = "";
let t2_id = "";
let t3_id = "";
const testId1 = "611e9c2e000518206084adf8";

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
        .expect(406)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
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
        .expect(406)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
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
        .send({"id": `${t2_id}`})
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
        .send({"id": `${t1_id}`, "name": "Test User"})
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
        .send({"id": `${t1_id}`, "name": "TestUser", "password": "1 2 3"})
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

    it("Should return 406 success: false, error: User doesn't exist", (done) => {
        server
        .put(`/api/user/${testId1}`)
        .send({"id": `${testId1}`, "name": "TestUser", "password": "123"})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });

    it("Should return 200 success: true, message: User successfully updated", (done) => {
        server
        .put(`/api/user/${t1_id}`)
        .send({"id": `${t1_id}`, "name": "TestUser", "password": "1234"})
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
        .send({"id": `${t1_id}`})
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
        .send({"id": `${t1_id}`})
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
        .send({"id": `${t1_id}`})
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
    it("Should return 406, success: false, error: User doesn't exist", (done) => {
        server
        .put(`/api/user/follow/${testId1}`)
        .send({"id": `${t1_id}`})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });
    it("Should return 406, success: false, error: User doesn't exist", (done) => {
        server
        .put(`/api/user/follow/${t1_id}`)
        .send({"id": `${testId1}`})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });
    it("Should return 401, success: false, error: You cannot unfollow yourself", (done) => {
        server
        .put(`/api/user/unfollow/${t1_id}`)
        .send({"id": `${t1_id}`})
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
        .send({"id": `${t1_id}`})
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
        .send({"id": `${t1_id}`})
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
    it("Should return 406, success: false, error: User doesn't exist", (done) => {
        server
        .put(`/api/user/unfollow/${t1_id}`)
        .send({"id": `${testId1}`})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });
    it("Should return 406, success: false, error: User doesn't exist", (done) => {
        server
        .put(`/api/user/unfollow/${testId1}`)
        .send({"id": `${t1_id}`})
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });
});

describe("DELETE /api/user/:id", () => {
    it("Should return 401 success: false, error: You can only delete your own account", (done) => {
        server
        .delete(`/api/user/${t1_id}`)
        .send({"id": `${t2_id}`})
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
        .send({"id": `${t2_id}`})
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
    it("Should return 406 success: false, error: User doesn't exist", (done) => {
        server
        .get(`/api/user/${testId1}`)
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("User doesn't exist");
            done();
        });
    });

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

/*
    TWEET API TESTING
    -----------------
    List of existing users (for test):
        [
            {
                name: TestUser
                password: 1234
            }
        ]
*/

describe("DELETE /api/tweet/remove/all", () => {
    it("Should return 200 success: true, message: All tweets have been deleted", (done) => {
        server.delete("/api/tweet/remove/all")
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.message.should.equal("All tweets have been deleted")
            res.body.success.should.equal(true);
            done();
        });
    })
})

let tweetId1 = "";
let tweetId2 = "";
let tweetId3 = "";

describe("POST /api/tweet", () => {

    it("Should return 200 success: true, message: tweetInfo", (done) => {
        server
        .post("/api/tweet/")
        .send({
            "userId": t1_id,
            "post": "Test tweet to see if it works",
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.have.property("userId");
            tweetId1 = res.body.message._id;
            done();
        });
    });

    // retweet test
    it("Should return 200, success: true, message.parentId: ${tweetId1}", (done) => {
        server
        .post("/api/tweet/")
        .send({
            "userId": t1_id,
            "post": "This is a retweet!",
            "parentId": tweetId1
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.have.property("userId");
            res.body.message.parentId.should.equal(tweetId1);
            tweetId2 = res.body.message._id;
            done();
        });
    });

    it("Should return 406, success: false, error: Parent tweet doesn't exist", (done) => {
        server
        .post("/api/tweet/")
        .send({
            "userId": t3_id,
            "post": "This is a retweet!",
            "parentId": testId1
        })
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Parent tweet doesn't exist")
            done();
        });
    });

    // subtweet test
    it("Should return 403, success: false, error: Cannot be both subtweet and retweet", (done) => {
        server
        .post(`/api/tweet/subtweet/${tweetId1}`)
        .send({
            "userId": t1_id,
            "post": "Test tweet to see if it works",
            "parentId": tweetId1
        })
        .expect(403)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(403);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Cannot be both subtweet and retweet");
            done();
        });
    });

    it("Should return 200, success: true, message: Subtweet successful", (done) => {
        server
        .post(`/api/tweet/subtweet/${tweetId1}`)
        .send({
            "userId": t1_id,
            "post": "This is a subtweet (Thread)",
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("Subtweet successful")
            done();
        });
    });

    it("Should return 406, success: false, error: Tweet doesn't exist", (done) => {
        server
        .post(`/api/tweet/subtweet/${testId1}`)
        .send({
            "userId": t1_id,
            "post": "This is a subtweet (Thread)",
        })
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Tweet doesn't exist")
            done();
        });
    });
    
});

describe("GET /api/tweet", () => {
    // Get main tweet, parent tweet, and array of subtweets
    it("Should return 200 success: true, message: tweetInfo", (done) => {
        server
        .get(`/api/tweet/${tweetId1}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.have.property("userId");
            tweetId3 = res.body.message.subTweets[0];
            done();
        });
    });

    it("Should return 406 success: false, error: Tweet doesn't exist", (done) => {
        server
        .get(`/api/tweet/${testId1}`)
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Tweet doesn't exist")
            done();
        });
    });

    // retweet test
    it("Should return 200 success: true, message: tweetInfo", (done) => {
        server
        .get(`/api/tweet/${tweetId2}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.have.property("userId");
            done();
        });
    });

    // subtweet test
    it("Should return 200 success: true, message: tweetInfo", (done) => {
        server
        .get(`/api/tweet/comments/${tweetId1}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message[0]._id.should.equal(tweetId3);
            done();
        });
    });

    it("Should return 406 success: false, error: Tweet doesn't exist", (done) => {
        server
        .get(`/api/tweet/comments/${testId1}`)
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Tweet doesn't exist")
            done();
        });
    });
    
});

// tweetId1 text = "Test tweet to see if it works"

describe("PUT /api/tweet", () => {
    // Like
    it("Should return 200 success: true, message: Tweet has been liked", (done) => {
        server
        .put(`/api/tweet/like/${tweetId1}`)
        .send({
            "id": t1_id
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("Tweet has been liked");
            done();
        });
    });

    // Unlike
    it("Should return 200 success: true, message: Tweet has been unliked", (done) => {
        server
        .put(`/api/tweet/like/${tweetId1}`)
        .send({
            "id": t1_id
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("Tweet has been unliked");
            done();
        });
    });

    it("Should return 406 success: false, error: Tweet doesn't exist", (done) => {
        server
        .put(`/api/tweet/like/${testId1}`)
        .send({
            "id": testId1
        })
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Tweet doesn't exist");
            done();
        });
    });

    // Edit others tweet
    it("Should return 401 success: false, error: You can only update your own tweets", (done) => {
        server
        .put(`/api/tweet/${tweetId1}`)
        .send({
            "id": t2_id,  // This user doesnt work but doesnt matter for this test
            "post": "This is the new tweet (after update)"
        })
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal("You can only update your own tweets");
            done();
        });
    });

    it("Should return 406 success: false, error: Tweet doesn't exist", (done) => {
        server
        .put(`/api/tweet/${testId1}`)
        .send({
            "id": testId1,
            "post": "This is an editted tweet"
        })
        .expect(406)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(406);
            res.body.success.should.equal(false);
            res.body.error.should.equal("Tweet doesn't exist");
            done();
        });
    });

    // Edit own tweet
    it("Should return 200 success: true, message: The tweet has been updated", (done) => {
        server
        .put(`/api/tweet/${tweetId1}`)
        .send({
            "id": t1_id,  // This user doesnt work but doesnt matter for this test
            "post": "This is the new tweet (after update)"
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("The tweet has been updated");
            done();
        });
    });
    
});

/*
    CHAT API TESTING
    -----------------
    List of existing users (for test):
        [
            {
                name: TestUser
                password: 1234
            }
        ]
    start by adding TestUser2, TestUser3 with 1234 pass
*/

let chatId = "";

describe("Chat API Tests /api/chat", () => {
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser2",
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
            t2_id = res.body._id;  // Assign to global var for later int tests
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser2");
            done();
        });
    });
    it("Should return success: true, _id, name, token", (done) => {
        server.post("/api/user/register")
        .send({
            "name": "TestUser3",
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
            t3_id = res.body._id;  // Assign to global var for later int tests
            res.body.should.have.property('token');
            res.body.success.should.equal(true);
            res.body.name.should.equal("TestUser3");
            done();
        });
    });

    // DELETE ALL FOR TESTS

    it("should return 200 success: true, message: All chats have been deleted", (done) => {
        server.delete('/api/chat/remove/all')
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.message.should.equal("All chats have been deleted");
            done();
        });
    })

    // TEST POST
    it("Should return 200 success: true, members: array of members", (done) => {
        server
        .post(`/api/chat/`)
        .send({
            "senderId": t1_id,  // This user doesnt work but doesnt matter for this test
            "receiverId": t2_id
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.should.have.property("_id");
            chatId = res.body._id;
            res.body.should.have.property("members");
            done();
        });
    });

    // TEST PUT
    it("Should return 200 success: true, message: User successfully added", (done) => {
        server
        .put(`/api/chat/add/${chatId}`)
        .send({
            "id": t3_id
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("User successfully added");
            done();
        });
    });

    it("Should return 200 success: true, message: User successfully removed", (done) => {
        server
        .put(`/api/chat/remove/${chatId}`)
        .send({
            "id": t3_id
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.message.should.equal("User successfully removed");
            done();
        });
    });

    // TEST GET
    it("Should return 200 success: true, chats: Chat with user in it (1 chat)", (done) => {
        server
        .get(`/api/chat/${t1_id}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.should.have.property("chats");
            done();
        });
    });

    it("Should return 401 success: true, error: User not in chats", (done) => {
        server
        .get(`/api/chat/${t3_id}`)
        .expect(401)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(401);
            res.body.success.should.equal(false);
            res.body.error.should.equal(`User with id: ${t3_id} is not in any chats`);
            done();
        });
    });
});

/*
    MESSAGE API TESTING
    -----------------
    List of existing users (for test):
        [
            {
                name: TestUser
                password: 1234
            }, 
            {
                name: TestUser2,
                password: 1234
            },
            {
                name: TestUser3,
                password: 1234
            }
        ]
*/

describe("Message API Tests /api/message", () => {

    // DELETE ALL FOR TESTS

    it("should return 200 success: true, message: All messages have been deleted", (done) => {
        server.delete('/api/message/remove/all')
        .expect("Content-type", /json/)
        .expect(200)
        .end((err, res) => {
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.message.should.equal("All messages have been deleted");
            done();
        });
    })

    // TEST POST
    it("Should return 200 success: true, members: array of members", (done) => {
        server
        .post(`/api/message/`)
        .send({
            "chatId": chatId,  // This user doesnt work but doesnt matter for this test
            "sender": t1_id,
            "text": "Hello User! Nice to meet you!"
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            done();
        });
    });

    it("Should return 200 success: true, members: array of members", (done) => {
        server
        .post(`/api/message/`)
        .send({
            "chatId": chatId,  // This user doesnt work but doesnt matter for this test
            "sender": t2_id,
            "text": "Hello! Nice to meet you too!"
        })
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            done();
        });
    });

    // TEST GET
    it("Should return 200 success: true, chats: Chat with user in it (1 chat)", (done) => {
        server
        .get(`/api/message/${chatId}`)
        .expect(200)
        .end(function(err,res){
            if (err) {
                done(err);
            }
            res.status.should.equal(200);
            res.body.success.should.equal(true);
            res.body.should.have.property("messages");
            done();
        });
    });
});