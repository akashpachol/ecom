const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const {
  calculateProductTotal,
  calculateSubtotal,
} = require("../../config/cartSum");
const Razorpay = require("razorpay");
const { key_id, key_secret } = process.env;
var instance = new Razorpay({
  key_id: 'rzp_test_rwud39pugiL6zo',
  key_secret: 'JLkOG8uWsGrEd7GthYgW475S',
});

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .exec();

    if (!cart) {
      console.log("Cart not found.");
    }
    const cartItems = cart.items || [];
    const subtotal = calculateSubtotal(cartItems);
    const productTotal = calculateProductTotal(cartItems);
    const subtotalWithShipping = subtotal;
    
    const addressData = await Address.find({ user: userId });

    res.render("user/checkout", {
      userData,
      addressData,
      cart: cartItems,
      productTotal,
      subtotalWithShipping,
    });
  } catch (err) {
    console.error("Error fetching user data and addresses:", err);
  }
};



const razorpayOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { address, paymentMethod } = req.body;

    const user = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res.status(500).json({ success: false, error: "User or cart not found." });
    }

    if (!address) {
      return res.status(400).json({ error: "Billing address not selected" });
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;
     totalAmount = cartItems.reduce(
      (acc, item) => acc + (item.product.discount_price * item.quantity || 0),
      0
    );

    const options = {
      amount:  Math.round(totalAmount * 100), // Razorpay accepts amount in paisa
      currency: 'INR',
      receipt: `order_${Date.now()}`, // Use a timestamp as a receipt
      payment_capture: 1,
    };

    instance.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res
          .status(400)
          .json({ success: false, error: "Payment Failed", user });
      } else {
    
        res.status(201).json({success: true,
          message: "Order placed successfully.",
          order: razorpayOrder,
        });
      }
    });

    

   
  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    return res.status(400).json({ success: false, error: "Payment Failed" });
  }
};




const checkOutPost = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { address, paymentMethod } = req.body;

    const user = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res.status(500).json({ success: false, error: "User or cart not found." });
    }

    if (!address) {
      return res.status(400).json({ error: "Billing address not selected" });
    }

    const cartItems = cart.items || [];
    for (const cartItem of cartItems) {
      const product = cartItem.product;
  
      product?.sizes.map((size) => {
        if (size.size == cartItem.size) {
          size.stock -= cartItem.quantity;
        }
      });

      await product.save();
    }

    const totalAmount = cartItems.reduce(
      (acc, item) => acc + (item.product.discount_price * item.quantity || 0),
      0
    );

if (paymentMethod=="Wallet") {
  
  if (totalAmount <= user.walletBalance) {
    user.walletBalance -= totalAmount;
    await user.save();
    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
      status: "Confirmed",
      paymentMethod: paymentMethod,
      paymentStatus: "success",
      deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      items: cartItems.map((cartItem) => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        size: cartItem.size,
        price: cartItem.product.discount_price,
      })),
    });
  
    await order.save();
  }else{
    return res.status(500).json({ success: false, error: "insuficient balance." });
  }
  
} else if (paymentMethod=="onlinePayment")  {
  const order = new Order({
    user: userId,
    address: address,
    orderDate: new Date(),
    status: "Confirmed",
    paymentMethod: paymentMethod,
    paymentStatus: "success",
    deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    totalAmount: totalAmount,
    items: cartItems.map((cartItem) => ({
      product: cartItem.product._id,
      quantity: cartItem.quantity,
      size: cartItem.size,
      price: cartItem.product.discount_price,
    })),
  });

  await order.save();
  
}else if (paymentMethod=="CashOnDelivery")  {
  const order = new Order({
    user: userId,
    address: address,
    orderDate: new Date(),
    status: "Confirmed",
    paymentMethod: paymentMethod,
    paymentStatus: "Pending",
    deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
    totalAmount: totalAmount,
    items: cartItems.map((cartItem) => ({
      product: cartItem.product._id,
      quantity: cartItem.quantity,
      size: cartItem.size,
      price: cartItem.product.discount_price,
    })),
  });

  await order.save();
}else{

}

   

   
    cart.items = []; // Clearing items
    cart.totalAmount = 0; // Resetting totalAmount

    await cart.save(); // Save the updated cart

    res.status(200).json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const loadOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
    const order = await Order.find({ user: userData._id })
      .populate("user")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (userData) {
      res.render("user/order", { userData, order });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadOrderHistory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const orderId = req.params.id;
    const userData = await User.findById(userId);
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });

    res.render("user/orderDetails", { userData, order });
  } catch (error) {
    console.log(error.message);
  }
};

const orderCancel = async (req, res) => {
  try {
    const orderId = req.query.id;
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

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
      const user = order.user;

      for (const item of order.items) {
        const product = item.product;
    
        product?.sizes.map((size) => {
          if (size.size == item.size) {
            size.stock += item.quantity;
          }
        });
  
        await product.save();
      }
      if (
        order.paymentMethod == "Wallet" ||
        (order.paymentMethod == "onlinePayment"
        )
      ) {
        user.walletBalance += order.totalAmount;
        await user.save();
        order.paymentStatus = "Refunded";
      } else {
        order.paymentStatus = "Declined";
      }
  if (order.status=="Confirmed") {
    const updateData = await Order.findByIdAndUpdate(
      { _id: orderId },
      {
        $set: {
          status: "Cancelled",
        },
      }
    );
  }
 

    res.redirect("/orderSuccess");
  } catch (error) {
    console.log(error.message);
  }
};

const returnData =async (req, res)=>{
  const orderId = req.query.id;
const {reason}=req.body
const order = await Order.findOne({ _id: orderId })
.populate("user")
.populate({
  path: "items.product",
  model: "Product",
});

if (!order) {
return res.status(404).send("Order not found");
}
const user = order.user;
user.walletBalance += order.totalAmount;

console.log(user,"lkkkkk");
await user.save();
for (const item of order.items) {
  const product = item.product;

  product?.sizes.map((size) => {
    if (size.size == item.size) {
      size.stock += item.quantity;
    }
  });

  await product.save();
}
order.status = "Return Successfull";
order.paymentStatus = "Refunded";
await order.save();

res.status(200).json({ success: true, message: "return sucessfully" });
}

module.exports = {
  loadCheckout,
  checkOutPost,
  loadOrderDetails,
  loadOrderHistory,
  orderCancel,
  razorpayOrder,
  returnData
};
