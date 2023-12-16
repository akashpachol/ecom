const User = require("../../model/userModel");
const Address = require("../../model/addressModel");
// get register
const loadAddress = async (req, res) => {
    try {
        const userId =  req.session.user_id;

        const userData = await User.findById(userId);

        if (userData) {
            const addressData = await Address.find({user:userId});
            res.render("user/userAddress",{ userData,addressData });
          } else {
            res.redirect('/login');
          }
    
    } catch (error) {
      console.log(error.message);
    }
  };
  const loadAddAddress = async (req, res) => {
    try {
        const userId =  req.session.user_id;
      
        const userData = await User.findById(userId);
        if (userData) {
            res.render("user/addAddress", { userData, });
          } else {
            res.redirect('/login');
          }
    } catch (error) {
      console.log(error.message);
    }
  };

  const addAddress = async (req, res) => {
    try {
     
        const userId =  req.session.user_id;
  
      const { houseName,street,city,state,pincode  } = req.body;
 

     
  
      const address = new Address({
        user: userId,
        houseName,
        street,
        city,
        state,
        pincode,
        is_listed:true
       
    });
    const addressData = await address.save();

   
    res.redirect("/userAddress");
  
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadEditAddress = async (req, res) => {
    try {
        const userId =  req.session.user_id;
      
        const userData = await User.findById(userId);
      const id = req.query.id;
      const address = await Address.findById(id);
  
      res.render("user/editAddres", {  userData, Address: address });
    } catch (error) {
      console.log(error.message); 
    }
  };

  const editAddress = async (req, res) => {
    try {
      const id = req.body.address_id;

      const { houseName,street,city,state,pincode  } = req.body;
      const updateData = await Address.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            houseName,
            street,
            city,
            state,
            pincode,
            is_listed:true
          },
        }
      );
      res.redirect("/userAddress");
    }
    catch (error) {
        console.log(error.message);
      }  
  
      
    } 


    
const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;

    const addressData = await Address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_listed: false,
        },
      }
    );
    res.redirect("/userAddress");
  } catch (error) {
    console.log(error.message);
  }
};

  
  



  module.exports = {
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress
    
  };