const express=require('express');
const userRoute=express();
const userControler=require('../controller/user/userController')
const addressControler=require('../controller/user/addressController')
const cartControler=require('../controller/user/cartController')
const orderController=require('../controller/user/orderController')
const couponController=require('../controller/admin/couponController')
const  { islogin,islogout }=require('../middleware/userAuth')

const multer=require('../middleware/multer')
//  registeration
userRoute.get('/register',islogout,userControler.loadRegister );
userRoute.post('/register',userControler.insertUser );

userRoute.get('/otp',userControler.loadOtp );
userRoute.post('/otp',userControler.verifyOtp );
userRoute.get('/resendOTP',userControler.resendOTP );
userRoute.get('/logout',islogin,userControler.userLogout );
userRoute.get('/Wallets',islogin,userControler.loadWallets );


// user
userRoute.get('/userprofile',userControler.loadprofile );
userRoute.post('/userprofile',multer.uploadUser.single('coverimage'), userControler.userEdit );
userRoute.get('/userAddress',addressControler.loadAddress );
userRoute.get('/addAddress',addressControler.loadAddAddress );
userRoute.post('/addAddress',addressControler.addAddress );
userRoute.get('/editAddress',addressControler.loadEditAddress );
userRoute.post('/editAddress',addressControler.editAddress );
userRoute.get('/deleteAddress',addressControler.deleteAddress );



// user login
userRoute.get('/login',islogout,userControler.loadLogin );
userRoute.post('/login',userControler.verifyLogin );
userRoute.get('/forgotPassword',islogout,userControler.loadForgetpassword );
userRoute.post('/forgotpassword',userControler.forgotPasswordOTP );
userRoute.get('/resetPassword',userControler.loadResetPassword );
userRoute.post('/resetPassword',userControler.resetPassword );
userRoute.post('/changePassword',userControler.resetPassword );


// home
userRoute.get('/',userControler.loadHome );
userRoute.get('/about',islogin,userControler.loadAbout );
userRoute.get('/contact',islogin,userControler.loadContact );
userRoute.get('/shop',islogin,userControler.loadShop );
userRoute.get('/singleProduct/:id',islogin,userControler.loadSingleShop );
userRoute.get('/shopCategoryFilter',islogin,userControler.loadShopCategory );
userRoute.get('/shopBrandFilter',userControler.loadShopBrand );


// Cart
userRoute.get('/cart',islogin,cartControler.loadCartPage );
userRoute.post('/cart',islogin,cartControler.addTocart );
userRoute.put("/updateCart",islogin, cartControler.updateCartCount);
userRoute.delete("/removeCartItem",islogin, cartControler.removeFromCart);

// order
userRoute.get('/checkout',islogin,orderController.loadCheckout );
userRoute.post('/checkout',islogin,orderController.checkOutPost );
userRoute.post('/razorpayOrder',islogin,orderController.razorpayOrder );
userRoute.get('/orderSuccess',islogin,orderController.loadOrderDetails );
userRoute.get('/orderDetails/:id',islogin,orderController.loadOrderHistory );
userRoute.post('/orderCancel',islogin,orderController.orderCancel );
userRoute.post('/return',islogin,orderController.returnData );

userRoute.get('/coupons',islogin,couponController.userCouponList)

userRoute.post('/applyCoupon',islogin,orderController.applyCoupon)

module.exports=userRoute