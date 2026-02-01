var memoryCleaner = require('memoryCleaner');
const pixelGenerator = require('pixelGenerator');

var runCreep = require('runCreep');
var runRoom = require('runRoom');
var runLink = require('runLink');

var Tower = require('Tower');

module.exports.loop = function () {
    // Memory cleaner - 内存清理
    if (memoryCleaner && memoryCleaner.run) {
        memoryCleaner.run();
    }
    
    // Pixel generator - 像素生成
    if (pixelGenerator && pixelGenerator.generatePixel) {
        pixelGenerator.generatePixel();
    }

    // Creep management - 爬虫管理
    try {
        if (runCreep && runCreep.run) {
            runCreep.run();
        }
    } catch (error) {
        console.log('runCreep error:', error);
    }
    
    // Room management - 房间管理
    try {
        if (runRoom && runRoom.run) {
            runRoom.run();
        }
    } catch (error) {
        console.log('runRoom error:', error);
    }
    
    // Link management - Link 管理
    try {
        if (runLink && runLink.run) {
            runLink.run();
        }
    } catch (error) {
        console.log('runLink error:', error);
    }
    
    // Tower management - 塔楼管理
    try {
        if (Tower && Tower.run) {
            Tower.run();
        }
    } catch (error) {
        console.log('Tower error:', error);
    }
}