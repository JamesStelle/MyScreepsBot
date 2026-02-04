var memoryCleaner = require('memoryCleaner');
const pixelGenerator = require('pixelGenerator');

var runCreep = require('runCreep');
var runRoom = require('runRoom');


var Tower = require('Tower');

module.exports.loop = function () {

    memoryCleaner.run();
    pixelGenerator.generatePixel();


    runCreep.run();
    runRoom.run();
    
    
    Tower.run();
    
    
}