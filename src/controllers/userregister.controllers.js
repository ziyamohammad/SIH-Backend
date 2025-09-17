
import { asynchandler } from '../utils/Asynchandler.js';
import { Apierror } from '../utils/Apierror.js';
import User from '../models/users.models.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { Apiresponse } from '../utils/Apiresponse.js';
import nodemailer from "nodemailer"

import { uploadcloudinary } from '../utils/cloudinary.js';


function generateotp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const authregister = asynchandler(async (req, res) => {
  try {
    const { name, officialEmail, officeLocation, agencyName, gender, password } = req.body;

    if (!name || !officialEmail || !officeLocation || !gender || !password || !agencyName) {
      throw new Apierror(400, "Please enter all the required fields");
    }

    let user = await User.findOne({
      "authorities.officialEmail": officialEmail
    });

    if (user) {
      throw new Apierror(400, "Authority already registered");
    }

    let rootUser = await User.findOne();
    if (!rootUser) {
      rootUser = new User({ citizens: [], authorities: [] });
    }

    rootUser.authorities.push({
      name,
      officialEmail,
      officeLocation,
      agencyName,
      gender,
      password,
      alerts: []
    });

    await rootUser.save();
    res.status(201).json({ message: "Authority registered successfully", rootUser });
  } catch (error) {
    console.log("Error in registering authority", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});

const citizenregister = asynchandler(async (req, res) => {
  try {
    const { name, email, age, gender, password, location } = req.body;

    if (!name || !email || !age || !gender || !password || !location) {
      throw new Apierror(400, "Please enter all the required fields");
    }

    
    let user = await User.findOne({
      "citizens.email": email
    });

    if (user) {
      throw new Apierror(400, "Citizen already registered");
    }

    let rootUser = await User.findOne();
    if (!rootUser) {
      rootUser = new User({ citizens: [], authorities: [] });
    }

    rootUser.citizens.push({
      name,
      email,
      age,
      gender,
      password,
      location,
      alerts: []
    });

    await rootUser.save();
    res.status(201).json({ message: "Citizen registered successfully", rootUser });
  } catch (error) {
    console.log("Error in registering citizen", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
});

  const logincitizen = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Apierror(400, "Please enter all the required fields");
  }


  const userDoc = await User.findOne({ "citizens.email": email });
  if (!userDoc) {
    throw new Apierror(404, "Citizen not found");
  }


  const citizen = userDoc.citizens.find((c) => c.email === email);
  if (!citizen) {
    throw new Apierror(404, "Citizen not found");
  }

  
  const isMatch = await citizen.isPasswordCorrect(password);
  if (!isMatch) {
    throw new Apierror(401, "Invalid credentials");
  }

  
  const accessToken = userDoc.AccessTokenGenerate();
  const refreshToken = userDoc.RefreshTokenGenerate();

  
  userDoc.refreshtoken = refreshToken;
  await userDoc.save({ validateBeforeSave: false });

  
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "Citizen logged in successfully",
      citizen: {
        _id: citizen._id,
        name: citizen.name,
        email: citizen.email,
        age: citizen.age,
        gender: citizen.gender,
        location: citizen.location,
      },
      accessToken,
      refreshToken,
    });
});

const loginauth = asynchandler(async(req,res)=>{
  const {id} = req.body

  if(!id){
    throw new Apierror(300,"Enter all trhe fields")
  }

  const authdoc = await User.findOne({"authorities._id":id})

  if(!authdoc){
    throw new Apierror("Authority not found")
  }

  const authority = authdoc.authorities.find((a)=>a._id.toString()===id)

  const accessToken = authdoc.AccessTokenGenerate();
  const refreshToken = authdoc.RefreshTokenGenerate();

  
  authdoc.refreshtoken = refreshToken;
  await authdoc.save({ validateBeforeSave: false });

  
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "Authority logged in successfully",
      authority: {
        _id: authority._id,
        name: authority.name,
        email: authority.officialEmail,
        gender: authority.gender,
      },
      accessToken,
      refreshToken,
    });


})

const geminiapi = asynchandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    throw new Apierror(400, "Please enter a valid message");
  }

  const imagepath = req.files?.reportImage?.[0]?.path;
  if (!imagepath) {
    throw new Apierror(400, "Please upload image");
  }


  const imageBase64 = fs.readFileSync(imagepath).toString("base64");

  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: message },
          {
            inline_data: {
              mime_type: "image/png", // or jpeg depending on upload
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  res.status(200).json(
    new Apiresponse(
      200,
      response.response.text(),
      "Api fetched successfully"
    )
  );
});

const sendemail = asynchandler(async (req, res) => {
  const { gmail, name, message } = req.body;

  if (!gmail || !name || !message) {
    throw new Apierror(400, "All fields are required");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailoptions = {
    from: `"${name}" <${gmail}>`,  
    to: process.env.USER,
    subject: "QUERY MAIL",
    text: message,                 
  };

  transporter.sendMail(mailoptions, (error, info) => {
    if (error) {
      console.error("Email send error:", error);
      return res.status(400).json(new Apierror(400, "Mail not sent"));
    } else {
      return res
        .status(200)
        .json(new Apiresponse(200, "Email sent successfully", info));
    }
  });
});

const authreport = asynchandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    throw new Apierror(400, "Please fill all the required details");
  }

  const authdoc = await User.findOne({ "authorities._id": id });
  if (!authdoc) {
    throw new Apierror(404, "Authority not found");
  }

  const authority = authdoc.authorities.find((a) => a._id.toString() === id);
  if (!authority) {
    throw new Apierror(404, "Authority not found");
  }

  const otp = generateotp();

  req.session.otp = otp;
  req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
  req.session.authorityId = id;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  const mailoptions = {
    to: authority.officialEmail,
    from: process.env.USER,
    subject: "Samudram Authority Verification",
    text: `Your OTP for authority verification is ${otp}. It is valid for 5 minutes.`,
  };

  transporter.sendMail(mailoptions, (error, info) => {
    if (error) {
      console.error("Email send error:", error);
      return res.status(400).json(new Apierror(400, "Mail not sent"));
    } else {
      return res
        .status(200)
        .json(new Apiresponse(200, "OTP sent successfully", info));
    }
  });
});

const verifyotp = asynchandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    throw new Apierror(400, "OTP is required");
  }

  // Check if OTP exists in session
  if (!req.session?.otp || !req.session?.otpExpiry) {
    throw new Apierror(400, "No OTP session found");
  }

  // Check expiry
  if (Date.now() > req.session.otpExpiry) {
    // Clear OTP
    req.session.otp = null;
    req.session.otpExpiry = null;
    throw new Apierror(401, "OTP expired");
  }

  // Check OTP match
  if (otp === req.session.otp) {
    // OTP verified → clear it
    req.session.otp = null;
    req.session.otpExpiry = null;
    return res
      .status(200)
      .json(new Apiresponse(200, "OTP verified successfully"));
  } else {
    throw new Apierror(400, "Invalid OTP");
  }
});




export {authregister,citizenregister ,logincitizen,loginauth ,geminiapi ,sendemail,authreport , verifyotp}