module.exports = 
{
    msToTime(ms)
    {
        var days = Math.floor(ms / (24*60*60*1000));
        var daysms=ms % (24*60*60*1000);
        var hours = Math.floor((daysms)/(60*60*1000));
        var hoursms=ms % (60*60*1000);
        var minutes = Math.floor((hoursms)/(60*1000));
        var minutesms=ms % (60*1000);
        var sec = Math.floor((minutesms)/(1000));
        return days+" jours, "+hours+" heures, "+minutes+" minutes et "+sec+" secondes";
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    randomChoice(object)
    {
        var keys = Object.keys(object);
        return keys[Math.floor(keys.length * Math.random())]
    },
    getRandom(min, max)
    {
        return Math.round(Math.random() * max) + min;
    },
    getRandomList(list)
    {
        return list[this.getRandom(0, list.length-1)];
    },
    makeid(length) // Source : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }
}