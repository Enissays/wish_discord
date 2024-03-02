const Enmap = require('enmap');
const fn_ranks = require('./utilitary/fn_ranks');
const u_data = new Enmap({name: "points"});

var data = fn_ranks.getRanks({nickname: 'Yas', id: '451058575863840788'}, u_data);
console.log(data.artbooks[1]);
data.artbooks = [
    {
        name: 'Moments de courage',
        cover: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213505939995631748/tablette.png?ex=65f5b879&is=65e34379&hm=a57295635ea3d1f2e84ea2e2c3325d842c939c1e6057adf4f4ce907f5fbe69f0&',
        pages: [    
            {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213507057886695424/projetartKibogaoka.png?ex=65f5b984&is=65e34484&hm=db178a5d364aef338f1dfc0c1871d2d27b637461ac896d9ec12271602b64fd03&',
            name: 'Fanart JSRF'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213507537442177105/Tip.png?ex=65f5b9f6&is=65e344f6&hm=f1d810bfeabd20b2f04970116299fc135798245027d48a367bb8024ef53e07a5&',
            name: "Avant j'étais main Dark Pit"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213507761728528396/paluuuuuuppp.png?ex=65f5ba2c&is=65e3452c&hm=48a55b28c4b91afcd09b28185796b9d2bbc0f4828bf3e91d9ff4c87b8a53feb6&',
            name: "Avant j'étais main Palu"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213508058576195605/gakuensona.png?ex=65f5ba73&is=65e34573&hm=30b02acc72ec90615e107360a21754aac71a8fd2a2e52a807784d910eee3e5f1&',
            name: 'Gakuensona'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213508276696916038/HALLOWEENFINISHED.png?ex=65f5baa7&is=65e345a7&hm=b96872476126278809b49574aa40795d2dd626c6774f90dde322f2a225376205&',
            name: 'Hallowin'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213508515239305327/attaillus1.png?ex=65f5badf&is=65e345df&hm=de1ca757cf982ec32ee94370ec4277298dcb1f9017cb175f6280fab0e872bec2&',
            name: "j'ai perdu tour 1 de l'atta"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213508946346647632/ZINESO.png?ex=65f5bb46&is=65e34646&hm=8cf985a43112708180d1b75b80432cc2357e1a609261a7ed4fb43b60140c41d9&',
            name: "J'ai bossé sur l'illu quand même..."
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213509635177451600/LAURIANEFINIE.png?ex=65f5bbea&is=65e346ea&hm=971f42a261ae46d26044f5432e257c8caa479ad9874289e836bc4208e9e67c41&',
            name: 'Ah pour un moment de courage là'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213509974785921044/hbboux.png?ex=65f5bc3b&is=65e3473b&hm=35fa23e99696454b5588f9af70cbdccc518e2f97f41f7e9040ca5047a2953532&',
            name: 'Pour coty'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213510285516865686/commipeli2.png?ex=65f5bc85&is=65e34785&hm=eccb05a6b680b288a1a442722df50e48e0c8dbab1092e00e408a47324d441af2&',
            name: 'Un autre vrai moment de courage ça'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213511119285526538/olynightmarecolo.png?ex=65f5bd4c&is=65e3484c&hm=729e12ba23437b68e5d9b1328cdd472196a6678eeed97927cf5483ec68ecd62d&',
            name: 'Oly Nightmare - Oc Dr'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213511332578459648/diznilheindesss.png?ex=65f5bd7f&is=65e3487f&hm=9f6b3816ec62f34ab9fed850804cbb668bea39ecd682a1f8508c562da633b034&',
            name: "Redraw d'une photo"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213511814269239336/spaltoon3.png?ex=65f5bdf2&is=65e348f2&hm=f536df132d315f34d353bc783a00573f68aaf83135cb3886aecd85c89f7a8710&',
            name: 'Fanart Deep Cut'
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213512353120002118/commivictini.png?ex=65f5be72&is=65e34972&hm=734facd61561bc2b559266490ca66a465e8f8394ec5d59c63ac0ddca0cfe8f6c&',
            name: "j'ai fait un malaise en le dessinant celui là"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213512943891910737/commibans.png?ex=65f5beff&is=65e349ff&hm=5542c5ef500df6a85b58951f324b60088c1606265cb2b7901c0545b265c109c5&',
            name: "Commi de Ban's"
          },
          {
            url: 'https://cdn.discordapp.com/ephemeral-attachments/1212460051126812704/1213513512576487444/lethal3.png?ex=65f5bf87&is=65e34a87&hm=6537134ab42cf83b91ca3bb181ec5bc10e879a213ff064076e65215de898bf1d&',
            name: 'shadow wizard money gang'
          }
        ],
        dateofcreation: Date.now(),
    }
];
u_data.set('451058575863840788', data);