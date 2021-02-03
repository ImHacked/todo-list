const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};



const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Wake Up"
});



const defaultItem = [item1];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, Result) {
    if (Result.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");

    } else {
      res.render("list", {
        kindOfday: "Today",
        newListItem: Result
      });
    }
  });
});

app.get("/:custom",function (req,res) {
     const customName=_.capitalize(req.params.custom);

     List.findOne({name:customName},function(err,foundList){
       if(!err){
         if(!foundList){
           const list=new List({
             name:customName,
             items:defaultItem
           });

           list.save();
           res.redirect("/"+customName);

         }else {
           res.render("list",{kindOfday: foundList.name,newListItem:foundList.items});
         }
       }
     });



});

app.post("/", function(req, res) {
  const next = req.body.newItem;
  const listName=req.body.list;


  const item = new Item({
    name: next
  });
  if (listName ==="Today") {
    item.save()
    res.redirect("/");

  } else {

    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);

      foundList.save();
      res.redirect("/"+ listName);

    });

  }

});

app.post("/delete",function(req,res){
  const checkedItemId=(req.body.checkBox);
  const listName=req.body.listName;

  if (listName==="Today") {

    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Deleted");
        res.redirect("/");

      }

    });

  } else {

   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList) {
               if(!err){
                 res.redirect("/"+listName);
               }
   });

  }



});


app.listen(3000, function() {

  console.log("Server is running");

});
