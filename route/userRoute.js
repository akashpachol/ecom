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


// user
userRoute.get('/userprofile',userControler.loadprofile );
userRoute.post('/userprofile',multer.uploadUser.single('image'), userControler.userEdit );
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
userRoute.get('/shop',userControler.loadShop );
userRoute.get('/singleProduct/:id',userControler.loadSingleShop );
userRoute.get('/shopCategoryFilter',userControler.loadShopCategory );
userRoute.get('/shopBrandFilter',userControler.loadShopBrand );


// Cart
userRoute.get('/cart',cartControler.loadCartPage );
userRoute.post('/cart',cartControler.addTocart );
userRoute.put("/updateCart", cartControler.updateCartCount);
userRoute.delete("/removeCartItem", cartControler.removeFromCart);

// order
userRoute.get('/checkout',orderController.loadCheckout );
userRoute.post('/checkout',orderController.checkOutPost );
userRoute.post('/razorpayOrder',orderController.razorpayOrder );
userRoute.get('/orderSuccess',orderController.loadOrderDetails );
userRoute.get('/orderDetails/:id',orderController.loadOrderHistory );
userRoute.post('/orderCancel',orderController.orderCancel );
userRoute.post('/return',orderController.returnData );

userRoute.get('/coupons',couponController.userCouponList)

userRoute.post('/applyCoupon',orderController.applyCoupon)
module.exports=userRoute