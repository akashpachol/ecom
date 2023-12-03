const Order = require("../../model/orderModel");

const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");

const Product = require("../../model/productModel");
const listUserOrders = async (req, res) => {
    try {
      const admin = req.session.adminData;
  
    
  
      const orders = await Order.find()
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        })

      res.render("admin/allOrder", { order:orders });
    } catch (error) {
      console.log(error.message);
    }
  };
const listOrderDetails=async(req,res)=>{

        try {
     
          const orderId = req.query.id;
  
          const order = await Order.findById(orderId)
          .populate("user")
          .populate({
            path: "address",
            model: "Address",
          })
          .populate({
            path: "items.product",
            model: "Product",
          })
     
          res.render("admin/orderDetails", { order });
        } catch (error) {
          console.log(error.message);
        }
      

}
const orderStatusChange = async (req, res) => {
    try {
  
      const orderId = req.query.id;
      const status = req.query.status;
 
   
 
   
 
      const order = await Order.findOne({ _id: orderId })
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        });
 
  
      const updateData = await Order.findByIdAndUpdate(
        { _id: orderId },
        {
          $set: {
            status:status
       
          },
        }
      );
    
  

      res.render("admin/orderDetails", { order });
   
  
    } catch (error) {
      console.log(error.message);
    }
  }; 


  const loadSalesReport =async(req,res)=>{


  res.render("admin/salesReport" );
  }

  
  module.exports={
    listUserOrders,
    listOrderDetails,
    orderStatusChange,
    loadSalesReport
  }