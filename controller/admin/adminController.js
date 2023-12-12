const bcrypt = require("bcrypt");
const User = require("../../model/userModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");

const Category = require("../../model/categoryModel");

const {
  getMonthlyDataArray,
  getDailyDataArray,
  getYearlyDataArray,
} = require("../../config/chartData");
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
    let query = {};
    const adminData = await User.findById(req.session.admin_id);
   
    const totalRevenue = await Order.aggregate([
      { $match: { "items.paymentStatus": "success" } }, // Include the conditions directly
      { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } },
    ]);
console.log(totalRevenue,"totalRevenue");
    const totalUsers = await User.countDocuments({ is_blocked: 1});
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const orders = await Order.find().populate("user").limit(10).sort({ orderDate: -1 });

    const monthlyEarnings = await Order.aggregate([
      {
        $match: {
          "items.paymentStatus": "success" ,
          orderDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $group: { _id: null, monthlyAmount: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenueValue =
    totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0;
  const monthlyEarningsValue =
    monthlyEarnings.length > 0 ? monthlyEarnings[0].monthlyAmount : 0;

    const newUsers = await User.find({ is_blocked: 1,isAdmin:0  })
      .sort({ date: -1 })
      .limit(5);

      // Get monthly data
      const monthlyDataArray = await getMonthlyDataArray();

      // Get daily data
      const dailyDataArray = await getDailyDataArray();
    
      // Get yearly data
      const yearlyDataArray = await getYearlyDataArray();

    const monthlyOrderCounts= monthlyDataArray.map((item) => item.count)
  
    const dailyOrderCounts= dailyDataArray.map((item) => item.count)

    const yearlyOrderCounts= yearlyDataArray.map((item) => item.count)

    res.render("admin/adminHome", {
      admin: adminData,
      totalRevenue:totalRevenueValue,
      totalOrders,
      totalCategories,
      totalProducts,
      totalUsers,
      newUsers,
      orders,
      monthlyEarningsValue,
      monthlyOrderCounts,
      dailyOrderCounts,
      yearlyOrderCounts,
    });
  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
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
