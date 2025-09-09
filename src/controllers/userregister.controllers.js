import mongoose from 'mongoose';
import { asynchandler } from '../utils/Asynchandler.js';
import { Apierror } from '../utils/Apierror.js';
import User from '../models/users.models.js';


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
    secure: false,
    sameSite: "Lax",
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
    secure: false,
    sameSite: "Lax",
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

export {authregister,citizenregister ,logincitizen,loginauth}