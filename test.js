var Enmap = require('enmap');



const u_data = new Enmap({name: "points"});
const ranks = require("./utilitary/fn_ranks.js");
const cards = require("./utilitary/cards.json");

var data = ranks.getRanks({id:"849936690915442698", username:"Eni"}, u_data);
data.coins = 50;
u_data.set("849936690915442698", data);
console.log(u_data.get("849936690915442698"));