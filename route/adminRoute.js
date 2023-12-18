const express = require("express");
const adminRoute = express();
const multer=require('../middleware/multer')
const adminController = require("../controller/admin/adminController");
const categoryController=require("../controller/admin/categoryController");
const productController=require('../controller/admin/productController')
const brandController=require('../controller/admin/brandController')
const orderController=require('../controller/admin/oderController')
const adminAuth = require("../middleware/adminAuth");
const couponController=require('../controller/admin/couponController')
const offerController=require('../controller/admin/offerController')
const bannerController=require('../controller/admin/bannerController')



// LOGIN
adminRoute.get("/", adminAuth.isLogout, adminController.loadAdminLogin);
adminRoute.get("/logout", adminController.adminLogout);
adminRoute.post("/", adminController.verifyLogin);

// user
adminRoute.get("/userData", adminAuth.isLogin, adminController.loadUserpage);
adminRoute.get('/unlistUser',adminAuth.isLogin,adminController.listUser)


// HOME
adminRoute.get("/home", adminAuth.isLogin, adminController.loadHome);


// Add Category
adminRoute.get("/category", adminAuth.isLogin, categoryController.loadCategory);
adminRoute.get("/addCategory", adminAuth.isLogin, categoryController.loadCategoryform);
adminRoute.post("/addCategory",multer.uploadCategory.single('image'), categoryController.addCategory);
adminRoute.get("/editCategory",adminAuth.isLogin,categoryController.loadEditCategory);
adminRoute.post("/editCategory",multer.uploadCategory.single('image'), categoryController.CategoryEdit);
adminRoute.get('/unlistCategory',adminAuth.isLogin,categoryController.unlistCategory)


// Add Brand
adminRoute.get("/brand", adminAuth.isLogin, brandController.loadBrand);
adminRoute.get("/addBrand", adminAuth.isLogin, brandController.loadBrandform);
adminRoute.post("/addBrand",multer.uploadCategory.single('image'), brandController.addBrand);
adminRoute.get("/editBrand",adminAuth.isLogin, brandController.loadEditBrand);
adminRoute.post("/editBrand",multer.uploadCategory.single('image'), brandController.BrandEdit);
adminRoute.get('/unlistBrand',adminAuth.isLogin,brandController.unlistBrand)


// Add Products
adminRoute.get("/products", adminAuth.isLogin, productController.loadProducts);
adminRoute.get("/addproduct", adminAuth.isLogin, productController.loadPorductForm);
adminRoute.post("/addproduct",multer.uploadProduct.array('image'), productController.addProduct);
adminRoute.get("/editProduct",adminAuth.isLogin, productController.loadEditPorductForm);
adminRoute.get("/deleteProduct/:id",adminAuth.isLogin, productController.deleteProduct);
adminRoute.post("/editProduct",multer.uploadProduct.array('image'), productController.storeEditProduct);

// All ORDERS
adminRoute.get("/alluserorders", adminAuth.isLogin, orderController.listUserOrders);
adminRoute.get("/orderDetails", adminAuth.isLogin, orderController.listOrderDetails);
adminRoute.put("/orderStatusChange", orderController.orderStatusChange);
adminRoute.get("/salesReport", adminAuth.isLogin, orderController.loadSalesReport);

// COUPON
adminRoute.get("/coupenAdd", adminAuth.isLogin,couponController.loadCouponAdd );
adminRoute.post("/coupenAdd",couponController.addCoupon );
adminRoute.get("/couponList", adminAuth.isLogin,couponController.loadCouponList );
adminRoute.get("/couponEdit", adminAuth.isLogin,couponController.loadEditCoupon );
adminRoute.put("/couponEdit",couponController.editCoupon );
adminRoute.get("/couponUnlist", adminAuth.isLogin, couponController.unlistCoupon);
adminRoute.get("/couponDetails", adminAuth.isLogin, couponController.couponDetails);

// offer
adminRoute.get("/offerAdd", adminAuth.isLogin,offerController.loadOfferAdd );
adminRoute.post("/offerAdd",offerController.addOffer );
adminRoute.get("/offerlist", adminAuth.isLogin,offerController.OfferList );
adminRoute.get("/offerEdit", adminAuth.isLogin,offerController.loadOfferEdit );
adminRoute.put("/offerEdit", adminAuth.isLogin,offerController.editOffer );

// banner
adminRoute.get("/bannerAdd", adminAuth.isLogin, bannerController.loadBannerAdd);
adminRoute.post("/bannerAdd", adminAuth.isLogin, bannerController.addBanner);
adminRoute.get("/bannerList", adminAuth.isLogin, bannerController.bannerList);
module.exports = adminRoute;
