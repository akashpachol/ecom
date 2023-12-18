const mongoose = require('mongoose');

const Product = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image:[{
    type:String,
    required:true
}],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  brand:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },

  price:{
    type:Number, 
    required:true
  },
  discountPrice: {
    type: Number,
  
  },


  sizes: [
    {
      size: String,
      stock: Number,
   
      
    },
  ],

 
  gender:{
    type: String,
    required: true,
  },
  productAddDate: {
    type: Date,
    default: Date.now, // Store the current date and time when the user is created
  },
  is_listed:{
    type:Boolean,
    default:true
},
discountStatus:{
  type:Boolean,
  default:false
},
discount:Number,
discountStart:Date,
discountEnd:Date,
 

  
});

module.exports = mongoose.model('Product', Product);

