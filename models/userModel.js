import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePicture: { type: String, default: "" },
        followers: { type: Array, default: [], },
        following: { type: Array, default: [], },

    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;