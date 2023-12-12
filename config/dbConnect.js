const mongoose = require('mongoose');

// Connect to MongoDB

  const dbConnection=()=>{
      try{
        const connect= mongoose.connect(process.env.mongo, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            })
            console.log('Connected to MongoDB');
      }catch(err){
          console.error('MongoDB   connection error:', err);
  }
  }
module.exports=dbConnection
