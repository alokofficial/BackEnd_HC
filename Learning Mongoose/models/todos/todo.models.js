import mongoose from 'mongoose';

const todoSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    subTodos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'SubTodo'
    }]
},{timestamps:true})

export const Todo = mongoose.model('Todo',todoSchema)