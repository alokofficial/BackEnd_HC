import mongoose,{Schema, model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoFile:{
        type: String, //cloudinary url
        required: true
    },
    thumbnail: {
        type: String, //cloudinary url
        required:true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number, //cloudinary 
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);