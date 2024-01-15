module.exports = 
{
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