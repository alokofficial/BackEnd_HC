import mongoose from 'mongoose';

const medicalRecordSchema = mongoose.Schema({
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Patient',
        required:true
    },
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },
    medicalReport:{
        type:String,
        required:true
    }
},{timestamps:true})

export const MedicalRecord = mongoose.model('MedicalRecord',medicalRecordSchema)