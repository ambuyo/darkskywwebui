// main server file 

//call needed packages 
var express = require("express")
var app = express()
var path = require("path")

//instantiate port 
var port = process.env.PORT || 3000


//default view engine
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

///load static files 
app.use(express.static(path.join(__dirname, './public')))

app.get('*', (req,res) => {
    res.render('index')
})

//launch server 
app.listen(port)
console.log("Application launched on port " +  port)

