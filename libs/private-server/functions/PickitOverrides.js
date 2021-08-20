//改写捡取检查方法，不捡回收药剂，只去商店购买
// Returns:
// -1 - Needs iding
// 0 - Unwanted
// 1 - NTIP wants
// 2 - Cubing wants
// 3 - Runeword wants
// 4 - Pickup to sell (triggered when low on gold)
Pickit.checkItem = function (unit) {
    var rval = NTIP.CheckItem(unit, false, true);

    if (Recycle.checkRecycle(unit) === -2) {
        return {
            result: 0,
            line: null
        };
    }

    if ((unit.classid === 617 || unit.classid === 618) && Town.repairIngredientCheck(unit)) {
        return {
            result: 6,
            line: null
        };
    }

    if (CraftingSystem.checkItem(unit)) {
        return {
            result: 5,
            line: null
        };
    }

    if (Cubing.checkItem(unit)) {
        return {
            result: 2,
            line: null
        };
    }

    if (Runewords.checkItem(unit)) {
        return {
            result: 3,
            line: null
        };
    }

    // If total gold is less than 10k pick up anything worth 10 gold per
    // square to sell in town.
    if (rval.result === 0 && Town.ignoredItemTypes.indexOf(unit.itemType) === -1 && me.gold < Config.LowGold && unit.itemType !== 39) {
        // Gold doesn't take up room, just pick it up
        if (unit.classid === 523) {
            return {
                result: 4,
                line: null
            };
        }

        if (unit.getItemCost(1) / (unit.sizex * unit.sizey) >= 10) {
            return {
                result: 4,
                line: null
            };
        }
    }

    return rval;
};