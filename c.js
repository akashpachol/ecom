const returnOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const reason = req.query.reason;

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
    console.log(req.query.reason);
    await order.save();

    for (const item of order.items) {
      const productId = item.product._id;
      const orderedQuantity = item.quantity;
      const product = await Product.findById(productId);

      if (product) {
        product.quantity += orderedQuantity;
        await product.save();
      }
    }

    const transactiondebit = new Transaction({
      user: user._id,
      amount: order.totalAmount,
      type: "credit",
      paymentMethod: order.paymentMethod,
      orderId: order._id,
      description: `Credited from wallet`,
    });
    await transactiondebit.save();

    order.status = "Return Successfull";
    order.paymentStatus = "Refunded";
    await order.save();

    res.redirect(`/admin/orderDetails?orderId=${orderId}`);
  } catch (error) {
    console.log(error.message);
  }
};