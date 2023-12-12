


const calculateSubtotal = (cart) => {

    let subtotal = 0;
    for (const cartItem of cart) {
 
      subtotal += cartItem.product.discount_price * cartItem.quantity;
    }
    return subtotal;
  };
  
  const calculateProductTotal = (cart) => {
    const productTotals = [];
    for (const cartItem of cart) {
      const total = cartItem.product.discount_price * cartItem.quantity;
      productTotals.push(total);
    }
    return productTotals;
  };
  module.exports = {

    calculateSubtotal,
    calculateProductTotal,
  };  