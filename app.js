const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date =require(__dirname+"/date.js");

const app=express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://nani:Nani%40123@cluster0.9sjwfvr.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemsSchema= {
    name:String
};

const Item= mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to ur todolist."
});
const item2=new Item({
    name:"Hit the +button to add new file"
});
const item3=new Item({
    name:"<---- Hit this to delete item"
});


const defaultItems= [item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]

};
const List=mongoose.model("List",listSchema);

 
app.get("/",async(req,res)=>{
    try{
        const foundItems=await Item.find({});
          
        if(foundItems.length === 0)
        {
            Item.insertMany(defaultItems)
               .then(function () {
                   console.log("Successfully saved defult items to DB");
                  })
                .catch(function (err) {
                   console.log(err);
                });
            res.redirect("/");
        }
        else
        {
            res.render("list", {
                listTitle: "Today",
                newListItems:foundItems
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
});

app.get("/:customerListName",function(req,res){
    const customListName=_.capitalize(req.params.customerListName);

    List.findOne({name:customListName}).then(foundList=>{
      
        
            if(!foundList){
                console.log("Doesnt exist!");
                const list=new List({
                    name: customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
            }
    
    });
  
});

app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    });

    if(listName==="Today")
    {
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}).then(foundList=>{
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);

        });
    }

});
app.post("/delete",function(req,res){
    const checkItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today")
    {
       Item.findByIdAndRemove(checkItemId)
       .then(()=>{
        console.log("deleted");
       res.redirect("/");
    })
       .catch(err=>{
        console.log(err)
       })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}},{new:true})
        .then(()=>{
           
            res.redirect("/"+listName);
            
        })
        .catch(err=>{
         console.log(err)
        })
    
    }
    
        
});


app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItems: workItems});
});
app.get("/about",function(req,res){
    res.render("about");
});



app.listen(3000,function(){
    console.log("server running in port 3000");
});