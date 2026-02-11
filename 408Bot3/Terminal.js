var Terminal = {
    getEnergyCost: function(fromRoom, toRoom, amount) {
        if (!fromRoom || !toRoom || typeof amount !== 'number' || amount <= 0) {
            return null;
        }
        var cost = Game.market.calcTransactionCost(amount, fromRoom, toRoom);
        return cost;
    },
    help: function(fromRoom, toRoom, amount) {
        var valid = !!fromRoom && !!toRoom && typeof amount === 'number' && amount > 0;
        if (valid) {
            var cost = Game.market.calcTransactionCost(amount, fromRoom, toRoom);
            var distance = Game.map.getRoomLinearDistance(fromRoom, toRoom);
            var perUnit = (cost / amount);
            console.log('from: ' + fromRoom + ' to: ' + toRoom + ' amount: ' + amount);
            console.log('distance: ' + distance + ' cost: ' + this.f(cost) + ' perUnit: ' + this.f(perUnit));
            console.log('send: Game.rooms[\"' + fromRoom + '\"].terminal.send(RESOURCE_ENERGY, ' + amount + ', \"' + toRoom + '\", \"note\")');
            console.log('deal: Game.market.deal(orderId, ' + amount + ', \"' + fromRoom + '\")');
            return cost;
        } else {
            console.log('Usage: Terminal.help(fromRoom, toRoom, amount)');
            console.log('send: Game.rooms[\"W1N1\"].terminal.send(RESOURCE_ENERGY, 5000, \"W2N3\", \"note\")');
            console.log('deal: Game.market.deal(orderId, 5000, \"W1N1\")');
        }
    },
    f: function(n) {
        return Number(n).toFixed(3);
    }
};

global.Terminal = Terminal;

module.exports = Terminal;
