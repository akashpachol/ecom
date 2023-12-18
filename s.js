if (discountedProduct) {
  const discountedProductData = await Product.findById(discountedProduct);

  let discount = 0;
  if (discountType === "percentage") {
    discount = (discountedProductData.price * discountValue) / 100;
  } else if (discountType === "fixed Amount") {
    discount = discountValue;
  }

  await Product.updateOne(
    { _id: discountedProduct },
    {
      $set: {
        discountPrice: calculateDiscountPrice(
          discountedProductData.price,
          discountType,
          discountValue
        ),
        discount,
        discountStart: startDate,
        discountEnd: endDate,
        discountStatus: true,
      },
    }
  );
} else if (discountedCategory) {
  const categoryData = await Category.findById(discountedCategory);
console.log("fghfh");
  await Category.updateOne(
    { _id: discountedCategory },
    {
      $set: {
        discountType,
        discountValue,
        discountStart: startDate,
        discountEnd: endDate,
        discountStatus: true,
      },
    }
  );

  const discountedProductData = await Product.find({
    category: categoryData.name,
  });

  for (const product of discountedProductData) {
    let discount = 0;
    if (discountType === "percentage") {
      discount = (product.price * discountValue) / 100;
    } else if (discountType === "fixed Amount") {
      discount = discountValue;
    }
    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          discountPrice: calculateDiscountPrice(
            product.price,
            discountType,
            discountValue
          ),
          discount,
          discountStart: startDate,
          discountEnd: endDate,
          discountStatus: true,
        },
      }
    );
  }
}