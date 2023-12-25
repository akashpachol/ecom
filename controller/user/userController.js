const bcrypt = require("bcryptjs");
const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const message = require("../../config/mailer");
const Category = require("../../model/categoryModel");
const Brand = require("../../model/brandModel");
const Wallet=require("../../model/walletModel")
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

// get register
const loadRegister = async (req, res) => {
  try {
    referral = req.query.referralCode;
    console.log(referral,"referral");
    res.render("user/register",referral);
  } catch (error) {
    console.log(error.message);
  }
};

// post register
const insertUser = async (req, res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const name = req.body.name;

    const password = req.body.password;
    if (!email || !mobile || !name || !password) {
      return res.render("user/register", {
        message: "Please fill in all the fields",
      });
    }
    req.session.referralCode = req.body.referralCode || null;
    const referralCode = req.session.referralCode;
    console.log(referralCode,"referralCode");
    const existMail = await User.findOne({ email: email });
    // const existnumber = await User.findOne({ email: email });
    if (referralCode) {
      referrer = await User.findOne({ referralCode:referralCode });
      console.log(referrer,"referrer");

      if (!referrer) {
        res.render("user/register", { message: "Invalid referral code." });
      }

      if (referrer.userReferred.includes(req.body.email)) {
        res.render("user/register", {
          message: "Referral code has already been used by this email.",
        });
      }
    }
    if (existMail) {
      res.render("user/register", { message: "this user already exists" });
    } else {
      req.session.userData = req.body;
      req.session.registerOtpVerify = 1;
      req.session.email = email;
      if (req.session.email) {
        const data = await message.sendVarifyMail(req, req.session.email);
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// GET OTP PAGE
const loadOtp = async (req, res) => {
  try {
    res.render("user/otp");
  } catch (error) {
    console.log(error.message);
  }
};

// VERIFYOTP
const verifyOtp = async (req, res) => {
  try {
    const userData = req.session.userData;
    const firstDigit = req.body.first;
    const secondDigit = req.body.second;
    const thirdDigit = req.body.third;
    const fourthDigit = req.body.fourth;
    const fullOTP = firstDigit + secondDigit + thirdDigit + fourthDigit;

    if (!req.session.user_id) {
      if (fullOTP == req.session.otp) {
        const secure_password = await securePassword(userData.password);
        const user = new User({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: secure_password,
          image:'',
          isAdmin: 0,
          is_blocked: 1,
        });

        const userDataSave = await user.save();
        if (userDataSave && userDataSave.isAdmin === 0) {
          req.session.user_id = userDataSave._id;

          if (req.session.referralCode) {
        
            const walletData = await Wallet.findOne({ user: req.session.user_id });
    if (walletData) {
      walletData.walletBalance +=50;
      walletData.transaction.push({
        type: "credit",
        amount:50,
      });
    
      await walletData.save(); 
    }else{
      const wallet = new Wallet({
        user: req.session.user_id,
        transaction:[{type:"credit",amount:50}],
        walletBalance:50,
    });
    await wallet.save();
    }
   
            const referrer = await User.findOne({
              referralCode: req.session.referralCode,
            });
            const user = await User.findOne({ _id: req.session.user_id });
            referrer.userReferred.push(user.email);
            await referrer.save();
            const walletrefer = await Wallet.findOne({ user: referrer._id });
          
            if (walletrefer) {
              walletrefer.walletBalance +=100;
              walletrefer.transaction.push({
                type: "credit",
                amount:100,
              });
            
              await walletrefer.save(); 
            }else{
              const wallet = new Wallet({
                user: referrer._id,
                transaction:[{type:"credit",amount:100}],
                walletBalance:100,
            });
            await wallet.save();
            }
            
          }
          res.redirect("/");
        } else {
          res.render("user/otp", { message: "Registration Failed" });
        }
      } else {
        res.render("user/otp", { error: "invailid otp" });
      }
    } else {
      if (fullOTP == req.session.otp) {
        res.redirect("/resetPassword");
      } else {
        res.render("user/otp", { error: "invailid otp" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    
    const userData = req.session.userData;

    if (!userData) {
      res.status(400).json({ message: "Invalid or expired session" });
    } else {
      delete req.session.otp;
      const data = await message.sendVarifyMail(req, userData.email);
    }



    res.render("user/otp", { message: "OTP resent successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.render("user/otp", { message: "Failed to send otp" });
  }
};

// GET LOGIN
const loadLogin = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};
// POST LOGIN
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", {
        message: "Please fill in all the fields",
      });
    }

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch && userData.isAdmin === 0 && userData.is_blocked == 1) {
        req.session.user_id = userData._id;
        res.redirect("/");
      } else {
        res.render("user/login", {
          message: "email and password is incorrect"
        });
      }
    } else {
      res.render("user/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// GET LOGIN
const loadForgetpassword = async (req, res) => {
  try {
    res.render("user/forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};
const forgotPasswordOTP = async (req, res) => {
  try {
    const emaildata = req.body.email;
  

    const userExist = await User.findOne({ email: emaildata });
    req.session.userData=userExist;
    req.session.user_id = userExist._id;
    if (userExist) {
      const data = await message.sendVarifyMail(req, userExist.email);
      return res.redirect("/otp");
    } else {
    
      res.render("user/forgotPassword", {
        error: "Attempt Failed",
        User: null,
      });
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
};

const loadResetPassword = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;

      
      const user = await User.findById(userId);

      res.render("user/resetPassword", { User: user });
    } else {
      res.redirect("/forgotPassword");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const resetPassword = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const password = req.body.password;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { password: secure_password } }
    );
    if (updatedData) {
      res.redirect("/userprofile");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadWallets = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
    if (!userData) {
      return res.render("user/login", { userData: null });
    }

    const walletData = await Wallet.findOne({ user: userId });

    if (!walletData) {
   
      return res.render("user/wallets", { userData, wallet: null });
    }

    res.render("user/wallets", { userData, wallet: walletData });
  } catch (err) {
  
    console.error("Error in loadWallets route:", err);
    res.status(500).send("Internal Server Error");
  }
};

const loadAbout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("user/about", {  userData,  });
    } else {
      res.render("user/about", { userData: null,  });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadContact = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("user/contact", {  userData,  });
    } else {
      res.render("user/contact", { userData: null,  });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadHome = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
    const productData = await Product.find();
    const categories = await Category.find();
    const brands = await Brand.find();
    if (userData) {
      res.render("user/home", { products: productData, userData, categories,brands });
    } else {
      res.render("user/home", { userData: null,products: productData, categories,brands  });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const productData = await Product.find();
    const categories = await Category.find();
    const brands = await Brand.find();
    
    res.render("user/shop", { products: productData, userData, categories,brands });
  } catch (error) {
    console.log(error.message);
  }
};

const loadShopCategory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const categoryId = req.query.id;
    const productData = await Product.find({category:categoryId});
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("user/shop", { products: productData, userData, categories,brands });
  } catch (error) {
    console.log(error.message);
  }
};
const loadShopBrand = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const brandId = req.query.id;
    const productData = await Product.find({brand:brandId});
    const categories = await Category.find();
    const brands = await Brand.find();
    res.render("user/shop", { products: productData, userData, categories,brands });
  } catch (error) {
    console.log(error.message);
  }
};

const loadSingleShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).send("User not found");
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const categories = await Category.find();

    if (!categories || categories.length === 0) {
      return res.status(404).send("Categories not found");
    }

    const brands = await Brand.find();

    if (!brands || brands.length === 0) {
      return res.status(404).send("Brands not found");
    }

    res.render("user/singleProduct", { userData, product, categories, brands });
  } catch (error) {
    console.log(error.message);
    return res.status(404).render("layout/404Error", { userData: null });
  }
};

const loadprofile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    if (userData) {
      res.render("user/userProfile", { userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    
  }
};

const userEdit = async (req, res) => {
  try {
    let id = req.body.user_id;

    const userData = await User.findById(id);

    const { name, mobile } = req.body;

    if(!req.file){
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
       
          },
        }
      );
    }
    else{
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
            image: req.file.filename,
          },
        }
      );
    }

  
  
    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  insertUser,
  loadRegister,
  loadHome,
  userLogout,
  loadOtp,
  verifyOtp,
  verifyLogin,
  resendOTP,
  loadShop,
  loadSingleShop,
  loadForgetpassword,
  forgotPasswordOTP,
  resetPassword,
  loadResetPassword,
  loadprofile,
  userEdit,
  loadShopCategory,
  loadShopBrand,
  loadWallets,
  loadAbout,
  loadContact
};
