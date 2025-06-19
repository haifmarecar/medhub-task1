const mongoose=require ('mongoose');
const productSchema= new mongoose.Schema({
    name:String,
    category:String,
    price:Number,
    available:Boolean,
    image:String,
    ownerId:{type:mongoose.Schema.Types.ObjectId,ref:'user'}});

    module.exports=mongoose.model('Product',productSchema);