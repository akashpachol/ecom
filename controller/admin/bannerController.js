const Banner = require("../../model/bannerModel");
const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
// Function to load banner adding page
const loadBannerAdd = async (req, res) => {
  try {
    const category = await Category.find();
    const product = await Product.find();
    const admin = req.session.admin_id;
    res.render("admin/bannerAdd", { admin, category, product });
  } catch (error) {
    console.log(error.message);
  }
};

// Function to add a banner
const addBanner = async (req, res) => {
    try {
      if (!req.body) {
        res.redirect("/admin/bannerAdd");
      }
  
      const image = req.file.filename;
  
      const {
        title,
        link,
        subtitle,
        offer,
        product,
        bannerCategory,
        fromDate,
        expiryDate,
        bannerType
      } = req.body;
      const newBanner = new Banner({
        title,
        image,
        link,
        subtitle,
        offer,
        product,
        category: bannerCategory,
        startDate: fromDate,
        endDate: expiryDate,
        bannerType
      });

      await newBanner.save();
  
      res.redirect("/admin/bannerList");
    } catch (error) {
      console.log(error.message);
    }
  };



const bannerList = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    let query = {};
    const limit = 7;
    const totalCount = await Banner.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    if (req.query.bannerType) {
      if (req.query.bannerType === "Category Banner") {
        query.bannerType = "Category Banner";
      } else if (req.query.bannerType === "Product Banner") {
        query.bannerType = "Product Banner";
      }else if (req.query.bannerType === "New Arrival") {
        query.bannerType = "New Arrival";
      } else if (req.query.bannerType === "Deals and Promotions") {
        query.bannerType = "Deals and Promotions";
      } else if (req.query.bannerType === "Seasonal Sales") {
        query.bannerType = "Seasonal Sales";
      }
      
    }
    const banner = await Banner.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startDate: -1 });
    res.render("admin/bannerList", { banner, admin, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
};
module.exports={
    loadBannerAdd,
    addBanner,
    bannerList
}