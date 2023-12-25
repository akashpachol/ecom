require("dotenv").config();
const path = require("path");
const express = require("express");
const userRoute = require("./route/userRoute");
const adminRoute = require("./route/adminRoute");
const dbConnection = require("./config/dbConnect");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnection();
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", "./views");

// Serve the static folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/assets")));

app.use(express.static(path.join(__dirname, "public/userassets")));

app.use((req,res,next)=>{
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    next()
  })
// Create a simple route
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use((req, res, next) => {
  res.status(404).render("./layout/404Error", { userData: null });
  next()
});



app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
