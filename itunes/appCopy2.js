var express = require("express");
var pathrequire = require('path');
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var strat = require('./routes/strat');
var stratover = require('./routes/stratover');
var field = require('./routes/field');
var fieldover = require('./routes/fieldover');
var admin = require('./routes/admin');
//var stratover = require('./routes/stratover');

//app.use(express.static(pathrequire.join(__dirname, 'public')));

//router.use(function (req,res,next) {
//  //console.log("/" + req.method);
//  console.log(req.path);
//  console.log(req.url);
//  next();
//});

app.use(strat);
app.use(stratover);
app.use(field);
app.use(fieldover);
app.use(admin);

app.get("/",function(req,res){
  res.redirect("https://uwb00034.ute.fedex.com/node/strat");
});

//app.get("//strat",function(req,res){
//  console.log("Sucessful Request made to " + req.path);
//  res.sendFile(path + "strat.html");
//});

//app.get("//stratover",function(req,res){
//  console.log("Sucessful Request made to " + req.path);
//  res.sendFile(path + "stratover.html");
//});
//
//app.get("//field",function(req,res){
//  console.log("Sucessful Request made to " + req.path);
//  res.sendFile(path + "field.html");
//});
//
//app.get("//fieldover",function(req,res){
//  console.log("Sucessful Request made to " + req.path);
//  res.sendFile(path + "fieldover.html");
//});

app.use("*",function(req,res){
  console.log("Bad Request made to " + req.path);
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});
