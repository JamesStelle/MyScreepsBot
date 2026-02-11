var roleHarvesterMineral = {
    run: function(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
        }
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }
        if (creep.memory.delivering) {
            var resourceType = null;
            var keys = Object.keys(creep.store);
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                if (creep.store[k] > 0 && k !== RESOURCE_ENERGY) {
                    resourceType = k;
                    break;
                }
            }
            if (!resourceType) {
                for (var j = 0; j < keys.length; j++) {
                    var kk = keys[j];
                    if (creep.store[kk] > 0) {
                        resourceType = kk;
                        break;
                    }
                }
            }
            var target = null;
            var extractor = creep.room.find(FIND_STRUCTURES, {
                filter: function(s) { return s.structureType === STRUCTURE_EXTRACTOR; }
            })[0];
            if (extractor) {
                var nearContainers = extractor.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: function(s) {
                        return s.structureType === STRUCTURE_CONTAINER &&
                               s.store.getFreeCapacity(resourceType) > 0;
                    }
                });
                if (nearContainers.length > 0) {
                    target = nearContainers[0];
                }
            }
            if (!target) {
                var terminal = creep.room.terminal;
                if (terminal && terminal.store.getFreeCapacity(resourceType) > 0) {
                    target = terminal;
                }
            }
            if (!target) {
                var storage = creep.room.storage;
                if (storage && storage.store.getFreeCapacity(resourceType) > 0) {
                    target = storage;
                }
            }
            if (target && resourceType) {
                if (creep.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                creep.say('⏳ wait');
            }
        } else {
            var mineral = creep.room.find(FIND_MINERALS)[0];
            if (mineral) {
                if (creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(mineral, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            } else {
                creep.say('❌ no mineral');
            }
        }
    }
};

module.exports = roleHarvesterMineral;
