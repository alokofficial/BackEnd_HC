import mongoose from 'mongoose';

const patientSchema = mongoose.Schema({

    name:{
        type:String,
        require:true,
    },
    diagosedWith:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    gender:{
        type:String,
        enum:['Male','Female','Other'],
        required:true
    },
    contactNumber:{
        type:String,
        required:true
    },
    bloodGroup:{
        type:String,
        required:true
    },
    medicalRecordId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'MedicalRecord',
        required:true
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },
    hospitalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital',
        required:true
    }

},{timestamps:true})

export const Patient = mongoose.model('Patient',patientSchema)