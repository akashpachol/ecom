const User = require("../model/userModel");

const islogin=async(req,res,next)=>{
    try {
    
      const userData = await User.findOne({ _id: req.session.user_id });
  if (req.session.user_id && userData.isAdmin==0 && userData.is_blocked===1 ) {

    next()
  } else {
 
    res.redirect('/')
  
  }


    } catch(error){
  console.log(error.message);
    }
}


const islogout=async(req,res,next)=>{
    try {
     
      const userData = await User.findOne({ _id: req.session.user_id });
        if (req.session.user_id && userData.isAdmin==0  ) {
  
            res.redirect('/')

        } else{
       
          next()
        }
      

    } catch(error){
  console.log(error.message);
    }
}

const error=((req, res, next) => {
  res.render("./layout/404Error", { userData: null });
  next()
});

module.exports={
    islogin,
    islogout,
    
}