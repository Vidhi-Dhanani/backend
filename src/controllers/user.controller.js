import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { application } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/ApiResponse.js";


const registerUser=asyncHandler( async (req,res)=>{
   
    const {fullname,email,username,password}=req.body
    console.log("email: ",email);
    console.log("password: ",password)

    if (
        [fullname , email , username, password].some((field)=>
            field ?.trim()==="")
    ) {
        throw new APIError(400,"All fields are required")
    } 

    const existedUser=User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser)
    {
        throw new APIError(409,"User with email or Username already exists")
    }

    const avatarLoacalPath=req.files?.avatar[0]?.path;
    const coverImageLoacalPath=req.files?.coverImage[0]?.path

    if(!avatarLoacalPath)
    {
        throw new APIError(400,"Avatar file is required")
    }


    const avatar=await uploadOnCloudinary(avatarLoacalPath)
    const coverImage=await uploadOnCloudinary(coverImageLoacalPath)

    if(!avatar)
    {
        throw new APIError(400,"Avatar file is required")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })

    const createdUser=await User.findById(user._id).select(
        "-passwod -refreshToken"
    )

    if(!createdUser)
    {
        throw new APIError(500,"Something went wron by registering the user")

    }

    return res.status(201).json(
        new APIResponse(200,createdUser,"User registered Successfully!!")

    )


})

export {registerUser}