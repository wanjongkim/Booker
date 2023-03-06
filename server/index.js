import express from "express"
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from 'dotenv'
import UserModel from "./models/User.js"
import bcrypt from "bcryptjs"

const bcryptSalt = bcrypt.genSaltSync();

dotenv.config()

const app = express();

const DB_URL = process.env.DB_URL;

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
const PORT = 3001;

await mongoose.connect(DB_URL)

app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    const userDoc = await UserModel.create({
        name,
        email,
        password:bcrypt.hashSync(password, bcryptSalt)
    })
    res.status(200).json("User added to the database!");
})


app.listen(PORT);
console.log(`Listening on port ${PORT}`);