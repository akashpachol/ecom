const Product = require("../../model/productModel");
const Category = require("../../model/categoryModel");
const Offer = require("../../model/offerModel");


// Function to load add offer page
const loadOfferAdd = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const product = await Product.find().sort({ date: -1 });
    const category = await Category.find().sort({ date: -1 });
    res.render("admin/offerAdd", { admin, product, category });
  } catch (error) {
    console.log(error.message);
  }
};


const addOffer = async (req, res) => {
  try {
      const admin = req.session.admin_id;

      const {
          offer_name,
          discountValue,
          discountType,
          discountOn,
          maxAmt,
          expiryDate,
          startDate,
          discountedProduct,
          discountedCategory,
      } = req.body;

      const existingNameOffer = await Offer.findOne({ name: offer_name });
      const existingCategoryOffer = discountedCategory && await Offer.findOne({ discountedCategory });
      const existingProductOffer = discountedProduct && await Offer.findOne({ discountedProduct });

      if (existingNameOffer) {
          return res.status(400).json({ success: false, error: "Duplicate Discount Name not allowed." });
      }

      if (discountedCategory && existingCategoryOffer) {
          return res.status(400).json({ success: false, error: "An offer for this category already exists." });
      }

      if (discountedProduct && existingProductOffer) {
          return res.status(400).json({ success: false, error: "An offer for this product already exists." });
      }
console.log("fdfgsjfdsfjhfdgsfdsj");
      const newOffer = new Offer({
          name: offer_name,
          discountOn,
          discountType,
          discountValue,
          maxAmt,
          startDate,
          endDate: expiryDate,
          discountedProduct,
     
      });

 

      if (discountedProduct) {
        newOffer.discountedProduct=discountedProduct;
  
          const discountedProductData = await Product.findById(discountedProduct);
          console.log(discountedProductData);

          let discount = 0;
          if (discountType === "percentage") {
              discount = (discountedProductData.price * discountValue) / 100;
          } else if (discountType === "fixed Amount") {
              discount = discountValue;
          }

          await Product.updateOne(
              { _id: discountedProduct },
              {
                  $set: {
                      discountPrice: calculateDiscountPrice(
                          discountedProductData.price,
                          discountType,
                          discountValue
                      ),
                      discount,
                      discountStart: startDate,
                      discountEnd: expiryDate,
                      discountStatus: true,
                  },
              }
          );
      } else if (discountedCategory) {
        newOffer.discountedCategory = discountedCategory;
          const categoryData = await Category.findById(discountedCategory);

          await Category.updateOne(
              { _id: discountedCategory },
              {
                  $set: {
                      discountType,
                      discountValue,
                      discountStart: startDate,
                      discountEnd: expiryDate,
                      discountStatus: true,
                  },
              }
          );

          const discountedProductData = await Product.find({
              category: categoryData.name,
          });

          for (const product of discountedProductData) {
              let discount = 0;
              if (discountType === "percentage") {
                  discount = (product.price * discountValue) / 100;
              } else if (discountType === "fixed Amount") {
                  discount = discountValue;
              }
              await Product.updateOne(
                  { _id: product._id },
                  {
                      $set: {
                          discountPrice: calculateDiscountPrice(
                              product.price,
                              discountType,
                              discountValue
                          ),
                          discount,
                          discountStart: startDate,
                          discountEnd: expiryDate,
                          discountStatus: true,
                      },
                  }
              );
          }
      }

      await newOffer.save();

      return res.status(200).json({ success: true, message: "Offer added successfully" });
  } catch (error) {
      return res.status(500).json({ success: false, error: "An error occurred while adding the offer" });
  }
};

// Helper function to calculate discount price
function calculateDiscountPrice(price, discountType, discountValue) {
  // Implement your logic to calculate the discounted price here
  // For example:
  let discountedPrice = price;

  if (discountType === "percentage") {
      discountedPrice -= (price * discountValue) / 100;
  } else if (discountType === "fixed Amount") {
      discountedPrice -= discountValue;
  }

  return discountedPrice;
}

  const OfferList = async (req, res) => {
    try {
      const admin = req.session.adminData;
      const page = parseInt(req.query.page) || 1;
      let query = {};
      const limit = 7;
      const totalCount = await Offer.countDocuments(query);
  
      const totalPages = Math.ceil(totalCount / limit);
      if (req.query.discountOn) {
        if (req.query.discountOn === "product") {
          query.discountOn = "product";
        } else if (req.query.discountOn === "category") {
          query.discountOn = "category";
        }
      }
      const offer = await Offer.find(query)
      .populate("discountedProduct")
      .populate("discountedCategory") 
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startDate: -1 });
      res.render("admin/offerList", {
        offer,
        admin: admin,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  

module.exports={
    loadOfferAdd,
    addOffer,
    OfferList
}
