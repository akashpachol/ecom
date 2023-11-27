
const Category = require("../../model/categoryModel");
const Product = require("../../model/productModel");
const fs=require('fs')


  
const loadCategoryform = async(req,res)=>{
  try{
      // const adminData = req.session.adminData;

      res.render('admin/addCategory')
  }
  catch(error){
      console.log(error.message)
  }
}

  
  const addCategory = async (req, res) => {
    try {

      let { name, description } = req.body;
      let image=''
      if (req.file) {
         image=req.file.filename
    }
     
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });
  
  
      if (existingCategory) {
        res.render('admin/addCategory', {
            error: "Category with the same name already exists",
          
        });
    } else {
        const category = new Category({
            name: name,
            image: image,
            description: description,
            is_listed:true
        });
        const categoryData = await category.save();
  
       
        res.redirect("/admin/category");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  const loadCategory = async (req, res) => {
    try {
      const categorydata = await Category.find();
      res.render("admin/category", { categorydata, message: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadEditCategory = async (req, res) => {
  

      try{
      
          const id = req.query.id;
          const categoryData = await Category.findById(id);
                  res.render('admin/editCategory',{category:categoryData});
      }catch(error){
          console.log(error.message)
      }
  }
  
  
  
  const CategoryEdit = async(req,res) =>{
    try{

      let id=req.body.category_id
      
      
    // Find the existing category by ID excluding the current category being edited
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      _id: { $ne: id } // Exclude the current category being updated from the search
    });


    if (existingCategory) {
      return res.render("admin/editCategory", {
        error: "Category name already exists",
        category: existingCategory
      });
    }
        if(!req.file){
          const categoryData = await Category.findByIdAndUpdate(
            { _id: id },
            {
              $set: {
                name: req.body.name,
                description: req.body.description
              },
            }
          );
        }
        else{
          const categoryData = await Category.findByIdAndUpdate(
            { _id:id },
            {
              $set: {
                name: req.body.name,
                image: req.file.filename,
                description: req.body.description
              },
            }
          );
        }

        

           
    res.redirect('/admin/category') 
        
    }catch(error){
        console.log(error.message)
    }

  }

  const unlistCategory = async (req, res) => {
    try {
      const id = req.query.id;
      const categoryvalue = await Category.findById(id);
      
      if (categoryvalue.is_listed) {
        const categoryData = await Category.updateOne(
          {_id:id},
          {
            $set: {
              is_listed: false
            },
          }
        );
      }else{
      
        const categoryData = await Category.updateOne(
          {_id:id},
          {
            $set: {
              is_listed: true
            },
          }
        );
      }
      
      res.redirect("/admin/category");
    } catch (error) {
      console.log(error.message);
    }
  };


  module.exports = {

    loadCategory,
    
    addCategory,
    loadEditCategory,
    loadCategoryform,
    unlistCategory,
    CategoryEdit,
    // listCategory
  };
  