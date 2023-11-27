
const Brand = require("../../model/brandModel");




  
const loadBrandform = async(req,res)=>{
  try{
      // const adminData = req.session.adminData;

      res.render('admin/brandAdd')
  }
  catch(error){
      console.log(error.message)
  }
}

  
  const addBrand = async (req, res) => {
    try {

      let { name, description } = req.body;
      let image=''
      if (req.file) {
         image=req.file.filename
    }
     
      const existingBrand = await Brand.findOne({ category: name });
  
  
      if (existingBrand) {
        res.render('admin/brandAdd', {
            error: "Brand with the same name already exists",
            admin: adminData
        });
    } else {
        const brand = new Brand({
            name: name,
            image: image,
            description: description,
            is_listed:true
        });
        const brandData = await brand.save();
  
       
        res.redirect("/admin/brand");
      }
    } catch (error) {
      console.log(error.message);
    }
  };


  const loadBrand = async (req, res) => {
    try {
      const brandData = await Brand.find();
      res.render("admin/brand", { brandData, message: "" });
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadEditBrand = async (req, res) => {
  

      try{
      
          const id = req.query.id;
          const brandData = await Brand.findById(id);
                  res.render('admin/brandEdit',{brand:brandData});
      }catch(error){
          console.log(error.message)
      }
  }
  
  
  





  const BrandEdit = async(req,res) =>{
    try{


      let id=req.body.brand_id
      
      const existingBrand = await Brand.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: id } // Exclude the current category being updated from the search
      });

      if (existingBrand) {
        return res.render("admin/brandEdit", {
          error: "brand name already exists",
          brand: existingBrand
        });
      }


      if(!req.file){
        const brandData = await Brand.findByIdAndUpdate(
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
        const brandData = await Brand.findByIdAndUpdate(
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

   
      
  

           

        

           
    res.redirect('/admin/brand') 
        
    }catch(error){
        console.log(error.message)
    }

  }

  

  const unlistBrand = async (req, res) => {


      try {
        const id = req.query.id;
        const Brandvalue = await Brand.findById(id);
        
        if (Brandvalue.is_listed) {
          const BrandData = await Brand.updateOne(
            {_id:id},
            {
              $set: {
                is_listed: false
              },
            }
          );
        }else{
        
          const BrandData = await Brand.updateOne(
            {_id:id},
            {
              $set: {
                is_listed: true
              },
            }
          );
        }
        
        res.redirect("/admin/brand");
      } catch (error) {
        console.log(error.message);
      }
    

   
  };

  module.exports = {

    loadBrand,
    
    addBrand,
    loadEditBrand,
    loadBrandform,
    unlistBrand,
    BrandEdit,


  };
  