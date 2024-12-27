import mongoose from 'mongoose';

const hospitalSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    contactNumber:{
        type:String,
        required:true
    },
    doctors:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    }],
    patients:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient',
        required:true
    }],
    specialisedIn:[{
        type:String,
        required:true
    }]
},{timestamps:true})

export const Hospital = mongoose.model('Hospital',hospitalSchema)