import express from 'express';
import path from 'path';
import md5 from "md5"
import session from 'express-session';
import passport from 'passport';
import passportLocal from "passport-local"

const users = []

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

//passport-local-authentication

app.use(passport.initialize())
app.use(passport.session())

passport.use(new passportLocal.Strategy(

  function (username, password, done) {
    const user = users.find(u => u.username === username)
 
    console.log(user)

    if (!user || user === undefined) { return done(null, false, { message: "incorect username" }) }

    if (user.password === md5(md5(password) + '_safe')) {
 
      return done(null, user)
    }

    done(null,null,{message:"incorect password"})


  }))
  // passport.serializeUser((user,done)=>{
    // done(null, user.id)
  // });
// 
  // passport.deserializeUser((id,done)=>{
    // done(null,users.map(u=>u.id===id))
// 
  // })

  app.get('/',(req,res)=>{
    res.sendFile(path.resolve('views/register.html'))
  })

app.post("/", (req, res) => {
  const { username, password } = req.body
  const hashPassword = md5(md5(password) + '_safe');
  if (username && password) {
    users.push({
      id:new Date(),
      username,
      password: hashPassword
    })
    
  }

  res.sendFile(path.resolve('views/login.html'))


})

app.get('/login',(req,res)=>{

  res.sendFile(path.resolve("views/login.html"))

})

app.post('/login',passport.authenticate('local',{
  successRedirect:'/home',
  failureRedirect:"/login"


}))

app.get("/home",  (req, res) => {

  if(req.isAuthenticated()===false){

    return res.redirect('/')

  }else{

    res.sendFile(path.resolve('views/home.html'))
  }
  
})



app.listen(process.env.PORT)

