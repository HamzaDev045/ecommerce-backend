import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { config } from '../../config/index.js'
import { apiError } from '../../utils/index.js'

export const userSchema = mongoose.Schema(
  {
   
    username: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    }
    
  ,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      lowercase: true
    },
    otp: {
      type: String},

      otpExpiry:{
        type: Date,
        default: null
      },
     posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],
    resetToken: { type: String, default: "" },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});


userSchema.pre('findOneAndUpdate', async function () {
  try {

    if (!this.getUpdate().password) return;
    const salt = await bcrypt.genSalt(config.saltWorkFactor);
    this.getUpdate().password = await bcrypt.hash(
      this.getUpdate().password,
      salt
    );
  } catch (error) {
    throw apiError.internal(error, 'pre findOneAndUpdate hook');
  }
});

userSchema.methods.checkPassword = async function (password) {
  try {
    const same = await bcrypt.compare(password, this.password);
    return same;
  } catch (error) {
    console.log(error, '')
    throw apiError.internal(error, 'checkPassword');
  }
};

export const UserModel = mongoose.model('User', userSchema);
