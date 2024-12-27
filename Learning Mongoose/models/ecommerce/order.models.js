import mongoose from "mongoose";

//minimodel
const orderItemSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    }
})

const orderSchema = mongoose.Schema({
    orderPrice:{
        type:Number,
        required:true,
    },
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderItems:{
        type:[orderItemSchema],
    },
    address:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","shipped","delivered"],
        default:"pending"
    }


},{timestamps:true});

export const Order = mongoose.model('Order',orderSchema);