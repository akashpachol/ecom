const mongoose = require('mongoose');

// Connect to MongoDB

  const dbConnection=()=>{
      try{
        const connect= mongoose.connect(`mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0.mdr1sg8.mongodb.net/hookah`, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            })
            console.log('Connected to MongoDB');
      }catch(err){
          console.error('MongoDB   connection error:', err);
  }
  }
module.exports=dbConnection
