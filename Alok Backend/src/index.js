// require('dotenv').config({ path: '../.env' });
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import {app} from './app.js';

dotenv.config({ path: '.env' });

connectDB()
.then(()=>{
    console.log("mongoDB connected")
    app.listen(process.env.PORT || 8000,()=>console.log(`server started on http://localhost:${process.env.PORT}`))
}).catch((error)=>{
    console.log("mongoDB connection failed !!!",error)
})
 




























/* approch 0
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
*/

/*  approch 1

import express from 'express';
const app = express();
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME} `)
        app.on("error", (error) => {
            console.error("error",error)
            throw error
        })
        app.listen(process.env.PORT,()=>console.log(`server started on port ${process.env.PORT}`))
    }catch(error){
        console.error("error",error)
    }
})()
    */