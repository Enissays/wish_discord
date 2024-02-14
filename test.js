var Enmap = require('enmap');



const u_data = new Enmap({name: "points"});
const ranks = require("./utilitary/fn_ranks.js");
const cards = require("./utilitary/cards.json");

var data = ranks.getRanks({id:"451058575863840788", username:"Yas"}, u_data);
data.cards.push("choose_me");
u_data.set("451058575863840788", data);
console.log(u_data.get("451058575863840788"));