var express = require('express');
var app = express();

app.get("//field",function(req,res){
  console.log("Successful GET Request to /field");
  res.sendFile("/opt/fedex/web/secure/public/itunes/views/field.html");
});

module.exports = app;