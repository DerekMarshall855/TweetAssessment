import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/leapgrad_twitter', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).catch(err => {
    console.error("Connection to DB failed, ERROR: ", err.message);
});

const db = mongoose.connection;

export default db;