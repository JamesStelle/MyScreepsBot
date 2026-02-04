// Safe require function with error handling
// 中文: 带错误处理的安全require函数
function safeRequire(moduleName) {
    try {
        return require(moduleName);
    } catch (error) {
        console.log(`Failed to require '${moduleName}':`, error.message);
        return null;
    }
}

// Safe module loading with fallback
// 中文: 带回退机制的安全模块加载
var memoryCleaner = safeRequire('memoryCleaner');
var memorySegmented = safeRequire('memorySegmented');
var pixelGenerator = safeRequire('pixelGenerator');
var runCreep = safeRequire('runCreep');
var runRoom = safeRequire('runRoom');
var runLink = safeRequire('runLink');
var Tower = safeRequire('Tower');
var PRTS = safeRequire('PRTS');
var runGeneralRoom = safeRequire('runGeneralRoom');

module.exports.loop = function () {
    // Global error handler for the main loop
    // 中文: 主循环的全局错误处理器
    try {
        // Memory cleaner - 内存清理
        if (memoryCleaner && memoryCleaner.run) {
            try {
                memoryCleaner.run();
            } catch (error) {
                console.log('memoryCleaner error:', error.message);
            }
        }
        
        // Segmented memory management - 分段内存管理
        if (memorySegmented && memorySegmented.run) {
            try {
                memorySegmented.run();
            } catch (error) {
                console.log('memorySegmented error:', error.message);
            }
        }
        
        // Pixel generator - 像素生成
        if (pixelGenerator && pixelGenerator.generatePixel) {
            try {
                pixelGenerator.generatePixel();
            } catch (error) {
                console.log('pixelGenerator error:', error.message);
            }
        }

        // Creep management - 爬虫管理
        if (runCreep && runCreep.run) {
            try {
                runCreep.run();
            } catch (error) {
                console.log('runCreep error:', error.message);
            }
        }
        
        // Room management - 房间管理
        if (runRoom && runRoom.run) {
            try {
                runRoom.run();
            } catch (error) {
                console.log('runRoom error:', error.message);
            }
        }
        
        // General room management - 通用房间管理
        if (runGeneralRoom && runGeneralRoom.run) {
            try {
                runGeneralRoom.run();
            } catch (error) {
                console.log('runGeneralRoom error:', error.message);
            }
        }
        
        // Link management - Link 管理
        if (runLink && runLink.run) {
            try {
                runLink.run();
            } catch (error) {
                console.log('runLink error:', error.message);
            }
        }
        
        // Tower management - 塔楼管理
        if (Tower && Tower.run) {
            try {
                Tower.run();
            } catch (error) {
                console.log('Tower error:', error.message);
            }
        }
        
        // PRTS system - 精密侦察战术支援系统
        if (PRTS && PRTS.monitorRoomStagnation) {
            try {
                PRTS.monitorRoomStagnation();
            } catch (error) {
                console.log('PRTS room stagnation monitoring error:', error.message);
            }
        }
        
    } catch (globalError) {
        // Catch any unexpected errors in the main loop
        // 中文: 捕获主循环中的任何意外错误
        console.log('Main loop critical error:', globalError.message);
        console.log('Stack trace:', globalError.stack);
    }
}