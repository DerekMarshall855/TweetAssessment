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
        usedId: { type: String, required: true },
        name: { type: String, required: true },
        post: { type: String, required: true },
        img: { type: String },
        likes: { type: Array, default: [] }
    },
    { timestamps: true }
);

const Tweet = mongoose.model("Tweet", tweetSchema);

export default Tweet;