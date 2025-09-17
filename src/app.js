import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();


app.use(cors({
    origin:"https://sih-frontend-two.vercel.app",
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:"true",limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.set("trust proxy", 1);



import {router} from './routes/user.routes.js'
import session from "express-session";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "samudram_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      httpOnly:true,
      secure:true,
      sameSite:"None",
      maxAge: 5 * 60 * 1000
     }, 
  })
);

app.use("/api/v1/user",router);



export {app}