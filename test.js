var Enmap = require('enmap');



const ranks = require("./utilitary/fn_ranks.js");
const cards = require("./utilitary/cards.json");

const u_data = new Enmap({name: "new_chocolates"});

var user_data = u_data.get("191272823170269184");
user_data.left = 1;
u_data.set("191272823170269184", user_data);