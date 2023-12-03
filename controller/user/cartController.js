const Cart=require('../../model/cartModel')
const User=require('../../model/userModel')
const Product = require("../../model/productModel");
const {calculateProductTotal,calculateSubtotal}=require('../../config/cartSum')
const loadCartPage = async (req, res) => {
  try {
      const userId = req.session.user_id;
      
      const userData = await User.findById(userId);
      
      if (userData) {
          const userCart = await Cart.findOne({ user: userId }).populate("items.product");
          
          if (userCart) {
             

              const cart = userCart ? userCart.items : [];


              const subtotal = calculateSubtotal(cart);
        
              const productTotal = calculateProductTotal(cart);
              const subtotalWithShipping = subtotal;
              
             
              let outOfStockError = false;
          
              if (cart.length > 0) {
                for (const cartItem of cart) {
                  const product = cartItem.product;
          
                  if (product.quantity < cartItem.quantity) {
                    outOfStockError = true;
                    break;
                  }
                }
              }
              let maxQuantityErr = false;
              if (cart.length > 0) {
                for (const cartItem of cart) {
                  const product = cartItem.product;
          
                  if (cartItem.quantity > 2) {
                    maxQuantityErr = true;
                    break;
                  }
                }
              }
          
              res.render("user/cart", { userData,
                productTotal,
      subtotalWithShipping,
      outOfStockError,
      maxQuantityErr,

                
                cart });
          } else {
              // Handle scenario where user has no cart
              res.render("user/cart", { userData, cart: null });
          }
      } else {
          res.redirect('/login');
      }
  } catch (error) {
      console.error("Error loading cart:", error);
      res.status(500).send("Error loading cart");
  }
}


const addTocart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const product_Id = req.body.productData_id;

    const { qty, size  } = req.body;

    const existingCart = await Cart.findOne({ user: userId }).populate("items.product");

   
    const productToUpdate = await Product.findById(product_Id);

    if (productToUpdate) {
      const selectedSize = productToUpdate.sizes.find((s) => s.size === size);
      console.log(selectedSize,"lllll");
      if (selectedSize && selectedSize.stock >= parseInt(qty)) {
        if (existingCart) {
       
       
          const existingCartItem = existingCart.items.find(
            (item) => item.product._id.toString() === product_Id
          );
       
          if (existingCartItem?.size==size) {
            existingCartItem.quantity += parseInt(qty);
        
          } else {
            existingCart.items.push({
              product: product_Id,
              quantity: parseInt(qty),
              size
            
            });
          }
          existingCart.total = existingCart.items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );

          await existingCart.save();
         
          return res.status(200).json({ success: true, message: 'Cart updated successfully' });
        } else {

          const newCart = new Cart({
            user: userId,
            items: [{ product: product_Id, quantity: parseInt(qty),size }],
            total: parseInt(qty, 10),
          });
      
          await newCart.save();
          return res.status(200).json({ success: true, message: 'New cart created successfully' });
        }
      } else {
        return res.status(400).json({ success: false, message: 'Out of stock or invalid quantity' });
        
      }
    } else {
      return res.status(400).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const updateCartCount = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const { newQuantity, newSize } = req.body;
   let newsizeData=parseInt(newSize, 10)

    const existingCart = await Cart.findOne({ user: userId }).populate("items.product");


   const productToUpdate = await Product.findById(productId);
   const selectedSize = productToUpdate.sizes.find((s) =>  s.size  === newSize
  );
 

    if (selectedSize && selectedSize.stock >= parseInt(newQuantity)) {
    

        const existingCartItem = existingCart.items.find((item) =>item.product._id.toString() === productId);

        if ( existingCartItem && existingCartItem.size === newsizeData) {

          existingCartItem.quantity = parseInt(newQuantity);
          existingCart.total = existingCart.items.reduce(
            (total, item) => total + (item.quantity || 0),
            0
          );
        }

        await existingCart.save();
        return res.status(200).json({ success: true, message: 'Cart updated successfully' });
     
    }    else {
      return res.status(400).json({ success: false, error: 'Out of stock or invalid quantity' });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, error: "Internal server error" });
  }
};






    
  const removeFromCart = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const productId = req.query.productId;
  
      const existingCart = await Cart.findOne({ user: userId });
      if (existingCart) {
        const updatedItems = existingCart.items.filter(
          (item) => item.product.toString() !== productId
        );
  
        existingCart.items = updatedItems;
        existingCart.total = updatedItems.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );
  
        await existingCart.save();
  
        res.json({ success: true ,toaster:true});
      } else {
        res.json({ success: false, error: "Cart not found" });
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.json({ success: false, error: "Internal server error" });
    }
  };
  





module.exports={
    loadCartPage,
    addTocart,
    updateCartCount,
    removeFromCart
}