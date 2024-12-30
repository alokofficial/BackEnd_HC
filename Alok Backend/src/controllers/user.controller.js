import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); //not validate all just save the refresh token
        return {accessToken,refreshToken};
    }catch(error){
        throw new ApiError(500,"something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user detail from the frontend
    //validation - not empty
    //check if user already exits:username or email
    //check for images, check for avatar
    //upload to cloudinary, avatar
    // create user object - create entry  in db
    //remove password and refresh token field from response
    // check for user creation 
    //return response


    const {fullName, username,email, password} = req.body;
    if(
        [fullName, username, email, password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required");
    }
    const existingUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existingUser){
        throw new ApiError(409,"User already exists with this username or email");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path;  
    // }

    if(!avatarLocalPath ){
        throw new ApiError(400,"Please upload avatar and cover image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Failed to upload avatar");
    }
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user");
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );


});

const loginUser = asyncHandler(async (req, res) => {
    // req body ==> data
    // username or email
    // find the user
    //password check
    //access and refresh token
    //send cookies
    //send response

    const {email,username, password} = req.body;
    // if(!username && !email){
    //     throw new ApiError(400,"Username or email is required");
    // }
    if(!(username || email)){
        throw new ApiError(400,"Username or email is required");  
    }
    const user =  await User.findOne({
        $or:[{username:username},{email}]
    });
    if(!user){
        throw new ApiError(404,"User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password); //take precaution we have to use mongodb collection name for custom function like here for mongoose we use User but for mongodb we use user
    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect");
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const option = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(
        new ApiResponse(200,{
            user:loggedInUser, accessToken, refreshToken
        },"User logged in successfully")
    );
    
});

const logoutUser = asyncHandler(async (req, res) => {
    //we need middleware to check if user is logged in
    //clear the cookies
    //send response
   await User.findByIdAndUpdate(
    req.user._id, 
    {
        $set: {
            refreshToken:undefined
        }
    },
    {
        new: true
    }
   )
   const option = {
        httpOnly: true,
        secure: true,
   }
   return res
   .status(200)
   .clearCookie("accessToken",option)
   .clearCookie("refreshToken",option)
   .json(
        new ApiResponse(200,{}, "User logged out successfully") 
   )
        
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    //check if refresh token is present
    //check if refresh token is valid
    //generate new access token
    //send response

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request");
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if(!decodedRefreshToken){
            throw new ApiError(401,"Invalid refresh token");
        }
        const user = await User.findById(decodedRefreshToken?._id);
        if(!user){
            throw new ApiError(401,"Invalid refresh token");
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refreshed token is expired or used");
        }
        const option = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken,refreshToken:newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newRefreshToken,option)
        .json(
            new ApiResponse(200, {
                accessToken,refreshToken:newRefreshToken
            },"Access token refreshed successfully")
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword =  asyncHandler(async (req, res) => {
    //req.body ==> data
    //check if user is logged in
    //check if current password is correct
    //check if new password is valid
    //update the password
    //send response

    const {oldPassword,newPassword} = req.body;
    // if(newPassword !== confirmPassword){
    //     throw new ApiError(400,"New password and confirm password does not match");
    // }
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Current password is incorrect");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"));


});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user,"current user fetched successfully");
});
const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName,email} = req.body;
    if(!(fullName || email)){
        throw new ApiError(400,"fullName or email is required");
    }
    const user = User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullName: fullName,
                email: email
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200, user,"Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
        fs.unlinkSync(avatarLocalPath);
        throw new ApiError(400,"Avatar upload failed");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
            {
                $set:{
                    avatar: avatar.url,
                }
            },{
                new: true
            },
        
    ).select("-password -refreshToken");
    if(!user){
        throw new ApiError(400,"User not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user,"Avatar updated successfully"));

});
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        fs.unlinkSync(coverImageLocalPath);
        throw new ApiError(400,"coverImage upload failed");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
            {
                $set:{
                    coverImage: coverImage.url,
                }
            },{
                new: true
            },
        
    ).select("-password -refreshToken");
    if(!user){
        throw new ApiError(400,"User not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user,"coverImage updated successfully"));

});

    // const user = await User.findByIdAndUpdate(
    //     req.user._id,
    //     {
    //         avatar: avatar.url
    //     },
    //     {
    //         new: true
    //     }
    // ).select("-password -refreshToken");

    // return res
    // .status(200)
    // .json(new ApiResponse(200, user,"Avatar updated successfully"));


export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
};