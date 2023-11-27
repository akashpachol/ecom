const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      
      cb(null, 'public/assets/imgs/category');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });
  const storeproductIMG = multer.diskStorage({
    destination: function (req, file, cb) {
      
      cb(null, 'public/assets/imgs/productIMG');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });
  const storeUser = multer.diskStorage({
    destination: function (req, file, cb) {
      
      cb(null, 'public/userassets/imgs/user');
    },
    filename: function (req, file, cb) {
      const fileName = Date.now() + path.extname(file.originalname);
      cb(null, fileName);
    }
  });

  module.exports = {
    uploadCategory: multer({ storage: storage }),
    uploadUser: multer({ storage: storeUser }),
    uploadProduct:multer({ storage: storeproductIMG })
  }