const mongoose = require('mongoose');

// Connect to MongoDB

  const dbConnection=()=>{
      try{
        const connect= mongoose.connect('mongodb://127.0.0.1:27017/hookah', {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            })
            console.log('Connected to MongoDB');
      }catch(err){
          console.error('MongoDB   connection error:', err);
  }
  }
module.exports=dbConnection
