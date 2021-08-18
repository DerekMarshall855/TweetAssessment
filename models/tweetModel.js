import mongoose from 'mongoose';

/*
    Name of Poster
    Tweet contents
    # of Likes
    List of comment IDs
    Timestamp
*/
const tweetSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        name: { type: String, required: true },
        post: { type: String, required: true },
        img: { type: String },
        likes: { type: Array, default: [] },
        parentId: { type: String, default: "" },  // If retweet create new tweet with parentId of retweet
        subTweets: { type: Array, default: [] }  // Make comments Tweets, add id to array
    },
    { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

export default Tweet;