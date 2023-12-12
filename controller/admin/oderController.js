const Order = require("../../model/orderModel");

const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");

const Product = require("../../model/productModel");
const dateFun=require("../../config/dateData")
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
     console.log(order,"order");
      res.render("admin/orderDetails", { order });
        } catch (error) {
          console.log(error.message);
        }
      

}
const orderStatusChange = async (req, res) => {
    try {
  
      const orderId = req.query.id;
      const {status,productId}=req.body
     
 

 
   
 
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
 
  console.log(order,"orderorder");



  const product = order.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (product) product.status = status;
  if (product.status=='Delivered') product.paymentStatus = 'success';
   

  
  const updateData = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        items: order.items,
        
      },
    },
    { new: true }
  );
    
  

      return res.status(200).json({ message: "Order status change successfully" });
   
  
    } catch (error) {
      return res
      .status(500)
      .json({ error: "An error occurred while change status the order" });
  
    }
  }; 



const loadSalesReport = async (req, res) => {
  let query = {};

  
        if (req.query.status) {
          if (req.query.status === "Daily") {
            query.orderDate = dateFun.getDailyDateRange();
          } else if (req.query.status === "Weekly") {
            query.orderDate = dateFun.getWeeklyDateRange();
          }else if (req.query.status === "Monthly") {
            query.orderDate = dateFun.getMonthlyDateRange();
          } 
          
          else if (req.query.status === "Yearly") {
            query.orderDate = dateFun.getYearlyDateRange();
          }
          else if (req.query.status === "All") {
            query["items.paymentStatus"] = "success";
          }
        }
  query["items.paymentStatus"] = "success";

  try {
    const orders = await Order.find(query)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 });

    // Calculate total revenue
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate total sales count
    const totalSales = orders.length;

    // Calculate total products sold
    const totalProductsSold = orders.reduce((acc, order) => acc + order.items.length, 0);

    res.render("admin/salesReport", {
      orders,
      totalRevenue,
      totalSales,
      totalProductsSold,
      req,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    // Handle error - send an error response or render an error page
    res.status(500).send("Error fetching orders");
  }
};


  const downloadPdf=()=>{
    const pdfPath = path.join(__dirname, 'path/to/your/pdf.pdf');

    // Read the PDF file
    fs.readFile(pdfPath, (err, data) => {
      if (err) {
        res.status(500).send('Error occurred while reading the PDF file.');
      } else {
        // Set headers to trigger a download prompt
        res.setHeader('Content-Disposition', 'attachment; filename="your_pdf_file.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
  
        // Send the file as a response
        res.status(200).json({ success: true, data, message: "download sucessfully" });
      }
    });
  }

  
  module.exports={
    listUserOrders,
    listOrderDetails,
    orderStatusChange,
    loadSalesReport,
    downloadPdf
  }