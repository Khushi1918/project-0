const express= require('express');
const bodyParser= require('body-parser');
const ejs=require('ejs');
const mongoose= require('mongoose');
const bcrypt=require('bcrypt');
const session = require('express-session');
const app= express();
const saltRounds = 10;
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({secret:'khushi_budhu_h'}));
const fetch = require("node-fetch");

mongoose.connect("mongodb://127.0.0.1:27017/recipeDB");
const recipeSchema= new mongoose.Schema({
    title:String,
    ingrediants:String,
    description:String

});
const loginSchema=new mongoose.Schema({
    email:String,
    name:String,
    password:String
});
const Recipe= mongoose.model('Recipe',recipeSchema);
const Login=mongoose.model('Login',loginSchema);
var log=false;
console.log(log);


app.get('/',function(req,res){
    if(!req.session.user_id){
    res.render('home',{change:"Signin"})
    }
    else{
        res.render('home',{change:"Logout"})
    }
})


app.get('/posts',function(req,res){
    Recipe.find({},function(error,foundrecipe){
        if(error){
            console.log(error)
        }
        else{
            if(!req.session.user_id){
        res.render('posts',{recipePost:foundrecipe,change:"Signin"})
            }
            else{
                res.render('posts',{recipePost:foundrecipe,change:"Logout"})
            }
        }
    })
})  

app.get('/yourrecipe',function(req,res){
    if(!req.session.user_id){
        res.redirect("/signin");
    }
    else{
    res.render('yourrecipe',{change:"Logout"});
    }
})

app.post('/yourrecipe',function(req,res){
    var head=req.body.title;
    var ind=req.body.ingrediants;
    var desp=req.body.description;
    const newrecipe= new Recipe({
        title:head,
        ingrediants:ind,
        description:desp
    });
    newrecipe.save();
    res.redirect('/posts')
});

var dishname="";
var dishcategory = "";
var dishArea="";
var dishinst="";
var image="";
var youtube="";

app.get('/recipe', function(req, res) {
    res.render('recipe');
});


app.post('/recipe',function(req,res){
    const query=req.body.recipe;
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s="+query+"";
    fetch(url)
    .then((response) => response.json())
    .then((rec)=>{
        // console.log(rec);
        dishname = rec.meals[0].strMeal;
         dishcategory = rec.meals[0].strCategory;
         dishArea = rec.meals[0].strArea;
         dishinst = rec.meals[0].strInstructions;
         image=rec.meals[0].strMealThumb;
         youtube=rec.meals[0].strYoutube;
         res.redirect('/recipeview');
    });
})


app.get('/recipeview',function(req,res){
    res.render('recipeview',{name:dishname,cat:dishcategory,org:dishArea,instruct:dishinst,pic:image,link:youtube});
})

app.get('/signin',function(req,res){
    res.render('Signin');
})

app.post('/signin',function(req,res){
    const uname=req.body.name;
    const upass=req.body.pass;
    Login.findOne({name:uname},function(err,founduser){
        if(err){
            console.log(err);
        }
        else if(founduser){
            bcrypt.compare(upass, founduser.password,function(err, result)
            {
                if(result ==1){
                    req.session.user_id = founduser.id;
                    res.redirect('/yourrecipe');
                }
                else{
                    res.redirect('/signin');
                }
            });
        }
    })
})

app.get('/signup',function(req,res){
    res.render('signup');
})

app.post('/signup',function(req,res){
    const data= req.body.rpass;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(data, salt, function(err, hash) {
            const newuser= new Login({
                email:req.body.remail,
                name:req.body.rname,
                password:hash
            })
            newuser.save();
            req.session.user_id = newuser.id;
            res.redirect('/');
        });
    });
    
    
})

app.get('/Logout',function(req,res){
    req.session.destroy();
    res.redirect('/');
})


app.listen(3000,function(req,res){
    console.log("Server running at 3000");
})