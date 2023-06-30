const express= require('express');
const https= require('https');
const bodyParser= require('body-parser');
const ejs=require('ejs');
const mongoose= require('mongoose');
const bcrypt=require('bcrypt');
const app= express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
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
app.get('/',function(req,res){
    if(log==false){
    res.render('home',{change:"Signin"})
    }
    else{
        res.render('home',{change:"Logout"})
    }
})
app.get('/yourrecipe',function(req,res){
    if(log == false){
        res.redirect("/signin");
    }
    else{
    res.render('yourrecipe',{change:"Logout"});
    }
})
app.get('/posts',function(req,res){
    Recipe.find({},function(error,foundrecipe){
        if(error){
            console.log(error)
        }
        else{
            if(log==false){
        res.render('posts',{recipePost:foundrecipe,change:"Signin"})
            }
            else{
                res.render('posts',{recipePost:foundrecipe,change:"Logout"})
            }
        }

    })
    
})  
app.get('/Logout',function(req,res){
    log=false;
    res.redirect('/');
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
    //console.log(newrecipe.title);
    res.redirect('/posts')
});

/*app.get('/recipe',function(req,res){
    const url="https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata"
    https.get(url,function(response){
        console.log(response);
        response.on("data",function(data){
            const rec= JSON.parse(data)
            const dish= rec.meals[0].strMeal
            console.log(dish)
            
        })
        
    })

})*/
var dishname="";
var dishcategory = "";
var dishArea="";
var dishinst="";
var image="";
var youtube="";
app.get('/recipe', function(req, res) {
    res.render('recipe');
  });
  app.get('/recipeview',function(req,res){
    res.render('recipeview',{name:dishname,cat:dishcategory,org:dishArea,instruct:dishinst,pic:image,link:youtube});
  })
app.post('/recipe',function(req,res){
    const query=req.body.recipe;
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s="+query+"";
    https.get(url, function(response) {
      let data = '';
  
      response.on("data", function(chunk) {
        data += chunk;
      });
  
      response.on("end", function() {
        const rec = JSON.parse(data);
         dishname = rec.meals[0].strMeal;
         dishcategory = rec.meals[0].strCategory;
         dishArea = rec.meals[0].strArea;
         dishinst = rec.meals[0].strInstructions;
         image=rec.meals[0].strMealThumb;
         youtube=rec.meals[0].strYoutube;
        res.redirect('/recipeview');

        
      });
    });
})

app.get('/signin',function(req,res){
    res.render('signin');

})
app.post('/signin',function(req,res){
    const uname=req.body.name;
    const upass=req.body.pass;
    Login.findOne({username:uname},function(err,founduser){
        if(err){
            console.log(err);
        }
        else if(founduser){
            const uhashpass=bcrypt.compare(upass,founduser.password);
            if(uhashpass == upass ){
                log=true;
                res.redirect('/yourrecipe');
            }
        }
    })

})

app.get('/signup',function(req,res){
    res.render('signup');
})
app.post('/signup',function(req,res){
    const data= req.body.rpass;
    const hashpass= bcrypt.hash(data,12);
    const newuser= new Login({
        email:req.body.remail,
        name:req.body.rname,
        password:hashpass
    })
    newuser.save();

})

app.listen(3000,function(req,res){
    console.log("Server running at 3000");
})