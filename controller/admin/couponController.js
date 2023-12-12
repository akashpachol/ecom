const Coupon=require('../../model/orderModel')


const loadCoupons = async (req, res) => {
    try {
        const adminId=req.session.admin_id
      const Coupon = await Coupon.find();
     
      
      res.render("admin/products", { Coupon });
    } catch (error) {
      console.log(error.message);
    }
  };