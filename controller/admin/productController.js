const Product = require("../../model/productModel");
const path=require('path')
const sharp=require('sharp')
const Category = require("../../model/categoryModel");
const Brand = require("../../model/brandModel");
const User=require("../../model/userModel")
const gender = ["gents", "ladies"];
const loadProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    let brands = await Brand.find({});
    res.render("admin/products", { products, categories, brands });
  } catch (error) {
    console.log(error.message);
  }
};

const loadPorductForm = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.admin_id });
    let categories = await Category.find({});
    let brands = await Brand.find({});
    console.log(brands, "brands", categories);
    res.render("admin/addProduct", { categories, gender, brands,admin: userData, });
  } catch (error) {
    console.log(error.message);
  }
};



const addProduct = async (req, res) => {
  try {
    const imageData = [];
    const imageFiles = req.files;

    for (const file of imageFiles) {

      const randomInteger = Math.floor(Math.random() * 20000001);
      const imageDirectory = path.join('public', 'assets', 'imgs', 'productIMG');
      const imgFileName = "cropped" + randomInteger + ".jpg";
      const imagePath = path.join(imageDirectory, imgFileName);

      const croppedImage = await sharp(file.path)
        .resize(580, 320, {
          fit: "cover",
        })
        .toFile(imagePath);

      if (croppedImage) {
        imageData.push(imgFileName);
      }
    }

    const { name, category, price,discount_price, productColor, gender, brand, description } = req.body;
    const sizedata = req.body.sizes;
    
    const addProducts = new Product({
      name,
      category,
      price,
      productColor,
      discount_price,
      gender,
      brand,
      description,
      sizes: sizedata,
      image: imageData,
    });

    await addProducts.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error while adding product");
  }
};




const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id, "kkkkkk");
    const productData = await Product.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_listed: false,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};



const loadEditPorductForm = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    let categories = await Category.find({});
    let brands = await Brand.find({});
    if (product) {
      res.render("admin/editProduct", { categories, gender, product,brands });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const storeEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.product_id  });
    let images=[],deleteData=[]

    const {
      name,
      category,
      price,
      discoutPrice,
      productColor,
      gender,
      brand,
      description,
    } = req.body;

    const sizedata = req.body.sizes;
    if (req.body.deletecheckbox) {
   
      deleteData.push(req.body.deletecheckbox); 
     
     
      
      deleteData = deleteData.flat().map(x=>Number(x))
      
      images = product.image.filter((img, idx) => !deleteData.includes(idx));
    }else{
      images = product.image.map((img)=>{return img});
    }
    if(req.files.length!=0){
      for (const file of req.files) {
        console.log(file, "File received");
  
        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = path.join('public', 'assets', 'imgs', 'productIMG');
        const imgFileName = "cropped" + randomInteger + ".jpg";
        const imagePath = path.join(imageDirectory, imgFileName);
  
        console.log(imagePath, "Image path");
  
        const croppedImage = await sharp(file.path)
          .resize(580, 320, {
            fit: "cover",
          })
          .toFile(imagePath);
  
        if (croppedImage) {
          images.push(imgFileName);
        }
      }
  
    }

 




    await Product.findByIdAndUpdate(
      { _id: req.body.product_id },
      {
        $set: {
          name,
          category,
          price,
          discount_price: discoutPrice,
          productColor,
          gender,
          brand,
          description,
          sizes: sizedata,
          image:images,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProducts,
  loadPorductForm,
  addProduct,
  deleteProduct,
  loadEditPorductForm,
  storeEditProduct,
};
