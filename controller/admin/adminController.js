const bcrypt = require("bcrypt");
const User = require("../../model/userModel");


const loadAdminLogin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
 
  }
};

const verifyLogin = async (req, res) => {

  try {
    const { email, password } = req.body;

    const adminData = await User.findOne({ email: email });

    if (adminData) {
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (passwordMatch && adminData.isAdmin === 1) {
    
        req.session.admin_id = adminData._id;

        res.redirect("/admin/home");
      } else {
        res.render("admin/login", {
          message: "Email and password are incorrect",
        });
      }
    } else {
      res.render("admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    const adminData = await User.findById(req.session.admin_id);
console.log(  req.session,"kkkk");
    if (adminData) {
      const orderCount = await Order.find({}).count();
      const productCount = await Product.find({}).count();
      res.render("admin/adminHome", { admin: adminData,
        orderCount,
        productCount,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error.message);

  }
};

const loadUserpage= async(req, res)=>{
  

  try {
    const adminData = await User.findById(req.session.admin_id);

    const usersData = await User.find({
      isAdmin:0
    });

    res.render('admin/userDashboard', { users: usersData, admin: adminData });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error: " + error.message);
  }
};


const listUser = async (req, res) => {


    try {
      const id = req.query.id;
      const Uservalue = await User.findById(id);
      
      if (Uservalue.is_blocked) {
        const UserData = await User.updateOne(
          {_id:id},
          {
            $set: {
              is_blocked: 0
            },
          }
        );
        if (req.session.user_id) delete req.session.user_id;
      }else{
      
        const UserData = await User.updateOne(
          {_id:id},
          {
            $set: {
              is_blocked: 1
            },
          }
        );
      }
      
      res.redirect("/admin/userData");
    } catch (error) {
      console.log(error.message);
    }
  

};



const adminLogout = async (req, res) => {
  try {

  
    delete req.session.admin_id;
 
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  
  }
};

module.exports = {
  loadAdminLogin,
  verifyLogin,
  loadHome,
  adminLogout,
  loadUserpage,
  listUser,

  

};
