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

app.use("/api/v1/user",router);


export {app}