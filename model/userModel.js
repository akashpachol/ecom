const mongoose =require("mongoose")

const user= mongoose.Schema({
  name:{
      type:String,
      required:true

  },
  email:{
      type:String,
      required:true

  },
  mobile:{
      type:String,
      required:true

  },
  password:{
      type:String,
      required:true

  },
  isAdmin:{
      type:Number,
      default:0,

  },
  image:{
    type:String
   
},
is_blocked:{
    type:Number,
    default:1,
},

referralCode: {
    type: String,
    default: RandomReferralCode,
    unique: true, 
},
userReferred: [{
    type: String,
    unique: true,
}],
})


function RandomReferralCode() {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let referralCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }
    return referralCode;
    }
module.exports=mongoose.model("User",user)