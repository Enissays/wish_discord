module.exports = 
{
    getRandom(min, max)
    {
        return Math.round(Math.random() * max) - min;
    },
    getRandomList(list)
    {
        return list[this.getRandom(0, list.length-1)];
    }
}