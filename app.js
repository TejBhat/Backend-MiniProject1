const express = require('express');
const app = express();
const userModel = require("./Models/user");
const postModel = require("./Models/post");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.render("index");
  });

  app.get('/login', (req, res) => {
    res.render("login");
  });

  app.get('/logout', (req, res) => {
    res.Cookie("token","");
    res.redirect("/login");
  });

app.post('/register', async (req, res) => {
  
  let { username, name, age, email, password } = req.body;
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User already registered");

    bcrypt.genSalt(10,(err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            let user =  await userModel.create({
                username,
                name,
                age,
                email,
                password: hash
            });
         let token =   jwt.sign({email:email, userid:user._id},"shhh");
         res.cookie('token', token);
         res.send("registered");
    })
})
    
  });

  app.post('/login', async (req, res) => {
  
    let { email, password } = req.body;
      let user = await userModel.findOne({email});
      if(!user) return res.status(500).send("Something went wrong");
  
     bcrypt.compare(password, user.password, (err, result)=>{

         if(result){
          let token =   jwt.sign({email:email, userid:user._id},"shhh");
          res.cookie('token', token);
          res.status(200).send("Logged in");
      

         } 
         else res.redirect("/login");
        
     })
      
    });
    function isLoggedIn(req,res,next){
      if(req.cookies.token ==="") res.send("You are not logged in");
      else{
        let data=jwt.verify(req.cookies.token,"shhh");
        req.user=data;
      }
      next();
    }

app.listen(3000);