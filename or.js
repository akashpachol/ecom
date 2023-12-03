const razorpayOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { address, paymentMethod, couponCode } = req.body;

    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      console.error("User or cart not found.");
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product) {
        return res
          .status(400)
          .json({ success: false, error: "Product Not Fount" });
      }

      if (product.quantity < cartItem.quantity) {
        return res
          .status(400)
          .json({ success: false, error: "Product Out Of Stock" });
      }
      const isDiscounted = product.discountStatus &&
      new Date(product.discountStart) <= new Date() &&
      new Date(product.discountEnd) >= new Date();

      const priceToConsider = isDiscounted ? product.discountPrice : product.price
      product.quantity -= cartItem.quantity;
      const GST = (18 / 100) * totalAmount;

      const itemTotal = priceToConsider * cartItem.quantity + GST;
      totalAmount += parseFloat(itemTotal.toFixed(2));

      await product.save();
    }

    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);
    }
    totalAmount = parseInt(totalAmount);

    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
      status: "Pending",
      paymentMethod: paymentMethod,
      deliveryDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      items: cartItems.map(cartItem => {
        const product = cartItem.product;
        const isDiscounted = product.discountStatus &&
          new Date(product.discountStart) <= new Date() &&
          new Date(product.discountEnd) >= new Date();
        const priceToConsider = isDiscounted ? product.discountPrice : product.price;
    
        return {
          product: product._id,
          quantity: cartItem.quantity,
          price: priceToConsider,
        };
      }),
    });

    await order.save();

    const options = {
      amount: totalAmount,
      currency: "INR",
      receipt: order._id,
    };

    razorpay.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res
          .status(400)
          .json({ success: false, error: "Payment Failed", user });
      } else {
        res.status(200).json({
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


const createRazorpayOrder = async (amount) => {
  return new Promise((resolve, reject) => {
    const options = {
      amount: amount * 100,
      currency: "INR",
    };

    razorpay.orders.create(options, (error, order) => {
      if (error) {
        reject(error);
      } else {
        resolve(order);
      }
    });
  });
};












