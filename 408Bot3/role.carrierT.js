var roleCarrierT = {
    run: function(creep) {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.delivering = false;
            creep.say('🔍 collect');
        }
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.delivering = true;
            creep.say('🚚 deliver');
        }
        if (creep.memory.delivering) {
            var towers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_TOWER &&
                               s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            if (towers.length > 0) {
                towers.sort((a, b) => {
                    var da = a.store.getFreeCapacity(RESOURCE_ENERGY);
                    var db = b.store.getFreeCapacity(RESOURCE_ENERGY);
                    if (db !== da) return db - da;
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                if (creep.transfer(towers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(towers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                var storage = creep.room.storage;
                var terminal = creep.room.terminal;
                var target = storage || terminal;
                if (target) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}, reusePath: 10});
                    creep.say('⏳ wait');
                } else {
                    creep.say('⏳ wait');
                }
            }
        } else {
            var storage = creep.room.storage;
            if (storage && storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#00ffff'}});
                }
                return;
            }
            var terminal = creep.room.terminal;
            if (terminal && terminal.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(terminal, {visualizePathStyle: {stroke: '#00ffff'}});
                }
                return;
            }
            var dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (r) => r.resourceType === RESOURCE_ENERGY && r.amount >= 100
            });
            if (dropped.length > 0) {
                dropped.sort((a, b) => {
                    if (b.amount !== a.amount) return b.amount - a.amount;
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                creep.say('🔽 drop');
                if (creep.pickup(dropped[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {visualizePathStyle: {stroke: '#ffff00'}});
                }
                return;
            }
            var ruins = creep.room.find(FIND_RUINS, {
                filter: (ruin) => ruin.store[RESOURCE_ENERGY] >= 50
            });
            if (ruins.length > 0) {
                ruins.sort((a, b) => {
                    if (b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                        return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                    }
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                creep.say('🏚️ ruins');
                if (creep.withdraw(ruins[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(ruins[0], {visualizePathStyle: {stroke: '#8B4513'}});
                }
                return;
            }
            var storage2 = creep.room.storage;
            var linksNearStorage = [];
            if (storage2) {
                linksNearStorage = storage2.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => structure.structureType === STRUCTURE_LINK &&
                                           structure.store[RESOURCE_ENERGY] > 0
                });
            }
            if (linksNearStorage.length > 0) {
                linksNearStorage.sort((a, b) => {
                    if (b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                        return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                    }
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                creep.say('🔗 link');
                if (creep.withdraw(linksNearStorage[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(linksNearStorage[0], {visualizePathStyle: {stroke: '#00ffff'}});
                }
                return;
            }
            var sources = creep.room.find(FIND_SOURCES);
            var containers = [];
            sources.forEach(source => {
                var sourceContainers = source.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER &&
                                           structure.store[RESOURCE_ENERGY] > 0
                });
                containers = containers.concat(sourceContainers);
            });
            if (containers.length > 0) {
                var uniqueContainers = containers.filter((container, index, self) =>
                    index === self.findIndex(c => c.id === container.id)
                );
                uniqueContainers.sort((a, b) => {
                    if (b.store[RESOURCE_ENERGY] !== a.store[RESOURCE_ENERGY]) {
                        return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                    }
                    return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                });
                creep.say('📦 container');
                if (creep.withdraw(uniqueContainers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(uniqueContainers[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                return;
            }
            var energy = creep.store[RESOURCE_ENERGY];
            var capacity = creep.store.getCapacity();
            creep.say(`E:${energy}/${capacity}`);
        }
    }
};

module.exports = roleCarrierT;
