var Enmap = require('enmap');



const u_data = new Enmap({name: "points"});
const ranks = require("./utilitary/fn_ranks.js");
const cards = require("./utilitary/cards.json");

u_data.delete("690531678086496337");
var data = ranks.getRanks({id:"690531678086496337", username:"Maggie"}, u_data);
data.cards = Object.keys(cards).filter((card) => !["robinet_double_chaud_froid", "alex_merde_ramadan", "eni_strong", "sidi_khalkhal", "tg_tom_2"].includes(card));
data.rank.level = 4;
data.coins = 50;
u_data.set("690531678086496337", data);
console.log(u_data.get("690531678086496337"));