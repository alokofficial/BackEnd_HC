import mongoose from 'mongoose';

const subTodoSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    markedAsDone:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    creationDate:{
        type:Date,
        default:Date.now
    },
},{timestamps:true})

export const SubTodo = mongoose.model('SubTodo',subTodoSchema)