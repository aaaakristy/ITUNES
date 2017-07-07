var express = require('express');
var app = express();

app.get("/admin",function(req,res){
  console.log("Successful GET Request to /admin");
  res.sendFile("/opt/fedex/web/secure/public/itunes/views/admin.html");
});

module.exports = app;