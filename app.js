const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const request = require("request");
const ejs = require('ejs');
const app = express();
const _ = require("lodash");

app.set("view engine" , "ejs");

app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ayush:ayush1234@cluster0.k69e4v7.mongodb.net/todolistDB",{useNewUrlParser: true});


const itemSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name:"Eat"
});
const item2 = new Item({
    name:"sleep"
});
const item3 = new Item({
    name:"code"
});
const item4 = new Item({
    name:"repeat"
});

const defaultItems = [item1,item2,item3,item4];

const listSchema = {
    name: String,
    items : [itemSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){console.log(err)}
            });
            res.redirect("/");
        }
        else{
            res.render("list",{newItems: foundItems,listTitle:"Today"});
        }
    });
});



app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name : itemName
    });
    if(listName === "Today"){
        item.save(); 
        res.redirect("/");
    }
    else{
        List.findOne({name : listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});




app.post("/delete",function(req,res){
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItem,function(err,foundList){
            if(err){console.log(err)}
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name : listName},{$pull:{items:{_id :checkedItem}}},function(err,foundList){
            if(!err){res.redirect("/"+ listName)}
        });
    }

    
});




app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name : customListName},function(err,foundList){
        if(!err){

            if(!foundList){
                //create a new list
                const list = new List({
                    name : customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //show the existing list
                res.render("list",{newItems: foundList.items,listTitle:foundList.name});
            }
        }
        
        
    });

});


// app.get("/work",function(req,res){
//     res.render("list",{listTitle : "work List",newItems:workItems});
// });

// app.post("/work",function(req,res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

// Port setup only 
app.listen(3000,function(){
    console.log("server is running on port 3000");
});