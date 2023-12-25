const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Wallet=require("../../model/walletModel")
const Coupon = require("../../model//coupenModel");
const {
  calculateDiscountedTotal,
  calculateProductTotal,
  calculateSubtotal,
} = require("../../config/cartSum");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_rwud39pugiL6zo",
  key_secret: "JLkOG8uWsGrEd7GthYgW475S",
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
    const currentDate = new Date();
    const coupon = await Coupon.find({
      expiry: { $gt: currentDate },
      is_listed: true,
    }).sort({ createdDate: -1 });
    res.render("user/checkout", {
      userData,
      addressData,
      cart: cartItems,
      productTotal,
      subtotalWithShipping,
      coupon
    });
  } catch (err) {
    console.error("Error fetching user data and addresses:", err);
  }
};
const razorpayOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { address, paymentMethod, couponCode, } = req.body;

    const user = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res
        .status(500)
        .json({ success: false, error: "User or cart not found." });
    }

    if (!address) {
      return res.status(400).json({ error: "Billing address not selected" });
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;
    totalAmount = cartItems.reduce(
      (acc, item) => acc + (item.product.discountPrice? item.product.discountPrice * item.quantity:item.product.price * item.quantity || 0),
      0
    );


    totalAmount = cartItems.reduce((acc, item) => {
      if (item.product.discountPrice && item.product.discountStatus &&
        new Date(item.product.discountStart) <= new Date() &&
        new Date(item.product.discountEnd) >= new Date()) {
        return acc + (item.product.discountPrice * item.quantity || 0);
      } else {
        return acc + (item.product.price * item.quantity || 0);
      }
    }, 0); 


    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);

    }

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

 

    instance.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res
          .status(400)
          .json({ success: false, error: "Payment Failed", user });
      } else {
        res.status(201).json({
          success: true,
          message: "Order placed successfully.",
          order: razorpayOrder,
        });
      }
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Payment Failed" });
  }
};


const checkOutPost = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { address, paymentMethod,couponCode } = req.body;
 

    const user = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res
        .status(500)
        .json({ success: false, error: "User or cart not found." });
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

    let totalAmount = cartItems.reduce((acc, item) => {
      if (item.product.discountPrice && item.product.discountStatus &&
        new Date(item.product.discountStart) <= new Date() &&
        new Date(item.product.discountEnd) >= new Date()) {
        return acc + (item.product.discountPrice * item.quantity || 0);
      } else {
        return acc + (item.product.price * item.quantity || 0);
      }
    }, 0);
    
  
    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);
    }

    if (paymentMethod == "Wallet") {
   
 const walletData = await Wallet.findOne({ user: userId });
 

      if (totalAmount <= walletData.walletBalance) {

        

          walletData.walletBalance -=totalAmount;
          walletData.transaction.push({
            type: "debit",
            amount:totalAmount,
          });
        
          await walletData.save(); 
        
 
        const order = new Order({
          user: userId,
          address: address,
          orderDate: new Date(),

          deliveryDate: new Date(
            new Date().getTime() + 5 * 24 * 60 * 60 * 1000
          ),
          totalAmount: totalAmount,
          coupon: couponCode,
          items: cartItems.map((cartItem) => ({
            product: cartItem.product._id,
            quantity: cartItem.quantity,
            size: cartItem.size,
            price:cartItem.product.discountPrice &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discountPrice:cartItem.product.price,
        
            status: "Confirmed",
            paymentMethod: paymentMethod,
            paymentStatus: "success",
          })),
        });
      

        await order.save();
      } else {
        return res
          .status(500)
          .json({ success: false, error: "insuficient balance." });
      }
    }
      if (paymentMethod == "onlinePayment") {
   
      const order = new Order({
        user: userId,
        address: address,
        coupon: couponCode,
        orderDate: new Date(),
        deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        totalAmount: req.body.amount,
        items: cartItems.map((cartItem) => ({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          size: cartItem.size,
       
          price:cartItem.product.discountPrice &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discountPrice:cartItem.product.price,
          status: "Confirmed",
          paymentMethod: "Online Payment",
          paymentStatus: "success",
        })),
      });

      await order.save();
    } else if (paymentMethod == "CashOnDelivery") {
      const order = new Order({
        user: userId,
        address: address,
        orderDate: new Date(),
        deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        totalAmount: totalAmount,
        coupon: couponCode,
        items: cartItems.map((cartItem) => ({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          size: cartItem.size,
     
          price:cartItem.product.discountPrice &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discountPrice:cartItem.product.price,
          status: "Confirmed",
          paymentMethod: paymentMethod,
          paymentStatus: "Pending",
        })),
      });

      await order.save();
    } else {
    }
    cart.items = []; // Clearing items
    cart.totalAmount = 0; // Resetting totalAmount

    await cart.save(); // Save the updated cart

    res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
  
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
      }).sort({ orderDate: -1 } );
      let orderData=order
    if (userData) {
      res.render("user/order", { userData, order:orderData });
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
    const { reason, productId } = req.body;
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
  
    const user_id=order.user._id;
   
    let totalAmount = order.totalAmount;
    const product = order.items.find(
      (item) => item.product._id.toString() === productId
    );

    const couponData = await Coupon.findOne({ code: order.coupon });


    if (product && product.product) {

      if (product.status === "Confirmed") {
 
        product.product.sizes.forEach((size) => {
          if (size.size === product.size.toString()) {
            size.stock += product.quantity;
          }
        });
        await product.product.save();
      }
      if (
        product.paymentMethod === "Wallet" ||
        product.paymentMethod === "Online Payment"
      ) {
        const walletData = await Wallet.findOne({ user: user_id });
        if (walletData) {
          walletData.walletBalance +=(product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100;
       
          walletData.transaction.push({
            type: "credit",
            amount:(product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100,
          });
        
          await walletData.save(); 
        }else{
          const wallet = new Wallet({
            user: user_id,
            transaction:[{type:"credit",amount: (product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100}],
            walletBalance:  (product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100
        });
  
        await wallet.save();
        }

    

        product.paymentStatus = "Refunded";
      } else {
        product.paymentStatus = "Declined";
      }
      product.status = "Cancelled";
      product.reason = reason;
      totalAmount =totalAmount- ((product.price * product.quantity)- (product.price * product.quantity)*(couponData?.discount?couponData.discount:0)/100);
    }

    const updateData = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          items: order.items,
          totalAmount
        },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while cancelling the order" });
  }
};

const returnData = async (req, res) => {
  const orderId = req.query.id;
  const { reason, productId } = req.body;
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
    const couponData = await Coupon.findOne({ code: order.coupon });
  const user_id=order.user._id;
  let totalAmount = order.totalAmount;

  const product = order.items.find(
    (item) => item.product._id.toString() === productId
  );


  if (product && product.product) {
   
    if (product.status === "Delivered") {
      product.product.sizes.forEach((size) => {
        if (size.size === product.size.toString()) {
          size.stock += product.quantity;
        }
      });
      await product.product.save();
    }

    const walletData = await Wallet.findOne({ user: user_id });

    if (walletData) {

      walletData.walletBalance +=(product.price * product.quantity)- (product.price * product.quantity)*(couponData.discount)/100;
   
      walletData.transaction.push({
        type: "credit",
        amount:(product.price * product.quantity)- (product.price * product.quantity)*(couponData.discount)/100,
      });
    
      await walletData.save(); 
    }else{


      const wallet = new Wallet({
        user: user_id,
        transaction:[{type:"credit",amount: (product.price * product.quantity)- (product.price * product.quantity)*(couponData.discount)/100}],
        walletBalance:  (product.price * product.quantity)- (product.price * product.quantity)*(couponData.discount)/100
    });

    await wallet.save();
    }


    product.status = "Returned";
    product.paymentStatus = "Refunded";
    product.reason = reason;
    totalAmount =totalAmount -(product.price * product.quantity)- (product.price * product.quantity)*(couponData.discount)/100;

  }

  await order.save();

  res.status(200).json({ success: true, message: "return sucessfully" });
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.session.user_id;
    const coupon = await Coupon.findOne({ code: couponCode });

    let errorMessage;

    if (!coupon) {
      errorMessage = "Coupon not found";
      return res.json({ errorMessage });
    }

    const currentDate = new Date();

    if (coupon.expiry && currentDate > coupon.expiry) {
      errorMessage = "Coupon Expired";
      return res.json({ errorMessage });
    }


    if (coupon.usersUsed.length >= coupon.limit) {
      errorMessage = "Coupon limit Reached";
      return res.json({ errorMessage });
    }

    if (coupon.usersUsed.includes(userId)) {
      errorMessage = "You already used this coupon";
      return res.json({ errorMessage });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .exec();


    const cartItems = cart.items || [];
    const orderTotal = calculateSubtotal(cartItems);

    if (coupon.minAmt>orderTotal) {
      errorMessage = "The amount is less than minimum  amount";
      return res.json({ errorMessage });
    }

    let discountedTotal = 0;


  
      discountedTotal = calculateDiscountedTotal(orderTotal, coupon.discount);
  
    if (coupon.maxAmt<discountedTotal) {
      errorMessage = "The Discount cant be applied. It is beyond maximum  amount";
      return res.json({ errorMessage });
    }

    res.status(200).json({ success: true,discountedTotal, message: "return sucessfully" });
    
  } catch (error) {
  
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

// Apply coupon Function
async function applyCoup(couponCode, discountedTotal, userId) {
  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon) {
    return discountedTotal;
  }
  const currentDate = new Date();
  if (currentDate > coupon.expiry) {
    return discountedTotal;
  }
  if (coupon.usersUsed.length >= coupon.limit) {
    return discountedTotal;
  }

  if (coupon.usersUsed.includes(userId)) {
    return discountedTotal;
  }

    discountedTotal = calculateDiscountedTotal(
      discountedTotal,
      coupon.discount
    );
  
  coupon.limit--;
  coupon.usersUsed.push(userId);
  await coupon.save();
  return discountedTotal;
}













module.exports = {
  loadCheckout,
  checkOutPost,
  loadOrderDetails,
  loadOrderHistory,
  orderCancel,
  razorpayOrder,
  returnData,
  applyCoupon
};
