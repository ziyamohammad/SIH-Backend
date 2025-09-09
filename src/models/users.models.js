import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const citizenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"], 
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  alerts: {
    type: [String],
    default: [],
  },
});

citizenSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


citizenSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


const authoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  officialEmail: {
    type: String,
    required: true,
    unique: true,
  },
  officeLocation: {
    type: String,
    required: true,
  },
  agencyName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  password: {
    type: String,
    required: true,
  },
  alerts: {
    type: [String], 
    default: [],
  },
});

authoritySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

authoritySchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userSchema = new mongoose.Schema({
  citizens: [citizenSchema],
  authorities: [authoritySchema],
  refreshtoken:{
    type:String
  }
});



userSchema.methods.AccessTokenGenerate = function(){
  return jwt.sign({
    _id:this.id,
    name:this.name,
    email:this.email,
  },
process.env.ACCESS_TOKEN ,
{
  expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
})
}

userSchema.methods.RefreshTokenGenerate = function(){
  return jwt.sign({
    _id:this.id,
  },
process.env.REFRESH_TOKEN ,
{
  expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
})
}



const User = mongoose.model("User", userSchema);

export default User;
