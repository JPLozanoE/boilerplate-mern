const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key')

const {User} = require('./models/user');
const {auth} = require("./middleware/auth")

mongoose.connect(config.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true,dbName:"boilerplate-mern" });

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

// respond with "hello world" when a GET request is made to the homepage
app.get('/',(req,res)=>{
    res.send("Hello worlddd");
});

app.get("/api/user/auth", auth, (req,res)=>{
  res.status(200).json({
    _id:req._id,
    isAuth:true,
    email:req.user.email,
    name:req.user.name,
    lastname:req.user.lastname,
    role:req.user.role
  })
})

app.post('/api/users/register',(req,res)=>{
  const user = new User(req.body)
  
  user.save()
  .then(() => res.status(200).json(`User '${req.body.name}' added!`))
  .catch((err) => res.status(400).json(`Unable to add user. Error: ${err}.`));
});

app.post('/api/user/login',(req,res)=>{
  //find the email
  User.findOne({email:req.body.email},(err,user)=>{
    if(!user) return res.json({
      loginSucces:false,
      message:"Auth failed, email not found"
    });

      //comparePassword
    user.comparePassword(req.body.password, (err,isMatch)=>{
      if(!isMatch){
        return res.json({loginSucces:false,message:"Wrong password"})
      }
    });

  //GenerateToken
  user.generateToken((err, user)=>{
    if(err) return res.status(400).send(err);
    res.cookie("x_auth",user.token)
      .status(200)
      .json({
        loginSucces:true
      })
  })
  })
});

app.get('/api/user/logout',auth, (req,res)=>{
  User.findOneAndUpdate({_id:req.user._id},{token:""}, (err,doc)=>{
    if(err) return res.json({success:false, err})
    return res.status(200).send({
      sucess:true
    })
  })
});

const port = process.env.PORT || 5001;
app.listen(port,()=>{
  console.log(`Server running at ${port}`)
});
console.log("Escuchando en el puerto 5001");

// Verificar conexion a base de datos
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conectado exitosamente');
});