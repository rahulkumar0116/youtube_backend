import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required :true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required :true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required :true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,  // cloudnariy
            required :true,
        },
        coverImage: {
            type: String,  // cloudnariy
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type:String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.method.genrateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


userSchema.method.isPasswordCorrect = async function
(password){
   return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)