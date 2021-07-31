Town.existBarriers = true; //私服是否有路障（是否使用自定义路线）

Town.getNearestTownSpot = function () {
    var i, name, townSpot, distance,
        townSpots = this.act[me.act - 1].spot,
        range = 99;

    for (var key in townSpots) {
        townSpot = townSpots[key];
        for (i = 0; i < townSpot.length; i += 2) {
            distance = getDistance(me, townSpot[i], townSpot[i + 1]);
            if (distance < range) {
                range = distance;
                name = key;
            }
        }
    }

    return name;
};

Town.moveToSpot = function (spot) {
    var i, path, townSpot,
        //longRange = (me.classid === 1 && this.telekinesis && me.getSkill(43, 1) && ["stash", "portalspot"].indexOf(spot) > -1) || spot === "waypoint";
        longRange = false;

    if (!this.act[me.act - 1].hasOwnProperty("spot") || !this.act[me.act - 1].spot.hasOwnProperty(spot)) {
        return false;
    }

    if (typeof (this.act[me.act - 1].spot[spot]) === "object") {
        townSpot = this.act[me.act - 1].spot[spot];
    } else {
        return false;
    }

    if (longRange) {
        path = getPath(me.area, townSpot[0], townSpot[1], me.x, me.y, 1, 8);

        if (path && path[1]) {
            townSpot = [path[1].x, path[1].y];
        }
    }

    for (i = 0; i < townSpot.length; i += 2) {
        //print("moveToSpot: " + spot + " from " + me.x + ", " + me.y);

        if (getDistance(me, townSpot[i], townSpot[i + 1]) > 2) {
            path = this.getPath(spot);
            if (this.existBarriers && path) {
                this.followPath(path);
                Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, false);
            } else {
                Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, true);
            }
        }

        switch (spot) {
            case "stash":
                if (!!getUnit(2, 267)) {
                    return true;
                }

                break;
            case "cain":
                if (!!getUnit(1, NPC.Cain)) {
                    return true;
                }

                break;
            case "palace":
                if (!!getUnit(1, "jerhyn")) {
                    return true;
                }

                break;
            case "portalspot":
            case "sewers":
                if (getDistance(me, townSpot[i], townSpot[i + 1]) < 10) {
                    return true;
                }

                break;
            case "waypoint":
                if (!!getUnit(2, "waypoint")) {
                    return true;
                }

                break;
            default:
                if (!!getUnit(1, spot)) {
                    return true;
                }

                break;
        }
    }

    return false;
};

Town.followPath = function (path) {
    /*
        path = [
        {
            x:123,
            y:123,
            breakBarrier: true
        },
    ]
    */

    var i, fire, fireUnit;

    for (i = 0; i < path.length; i++) {
        if (me.act === 1) {
            fireUnit = getPresetUnit(1, 2, 39);
            fire = {
                x: fireUnit.roomx * 5 + fireUnit.x,
                y: fireUnit.roomy * 5 + fireUnit.y
            };
            Pather.moveTo(path[i].x + fire.x, path[i].y + fire.y);
        } else {
            Pather.moveTo(path[i].x, path[i].y);
        }
        if (path[i].breakBarrier) {
            this.openChests(5, path[i].breakBarrier);
        }
    }

    return true;
};

Town.openChests = function (range, times) {
    var unit,
        unitList = [],
        containers = [
            "chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2",
            "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2",
            "cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl",
            "woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2",
            "icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl"
        ];

    range = range || 5;
    // if (!range) {
    //     range = 15;
    // }

    unit = getUnit(2);

    if (unit) {
        do {
            if (unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.indexOf(unit.name.toLowerCase()) > -1
                && this.validChest(unit.classid, unit.x, unit.y)) {
                unitList.push(copyUnit(unit));
            }
        } while (unit.getNext());
    }

    //print(unitList.length);

    while (times > 0 && unitList.length > 0) {
        unitList.sort(Sort.units);

        unit = unitList.shift();

        if (unit && (Pather.useTeleport || !checkCollision(me, unit, 0x4)) && this.openChest(unit)) {
            //Pickit.pickItems();
        }

        times--;
    }

    return true;
};

// Open a chest Unit
Town.openChest = function (unit) {
    // Skip invalid and Countess chests
    if (!unit || unit.x === 12526 || unit.x === 12565) {
        return false;
    }

    // already open
    if (unit.mode) {
        return true;
    }

    // locked chest, no keys
    if (me.classid !== 6 && unit.islocked && !me.findItem(543, 0, 3)) {
        return false;
    }

    var i, tick;

    for (i = 0; i < 3; i += 1) {
        sendPacket(1, 0x13, 4, unit.type, 4, unit.gid);
        tick = getTickCount();

        while (getTickCount() - tick < 1000) {
            if (unit.mode) {
                return true;
            }

            delay(10);
        }
    }

    if (!me.idle) {
        Misc.click(0, 0, me.x, me.y); // Click to stop walking in case we got stuck
    }

    return false;
};

Town.validChest = function (classid, x, y) {
    var i, objectList,
        fire, fireUnit,
        filePath = "libs/private-server/data/TownModes.json",
        townModes = JSON.parse(Misc.fileAction(filePath, 0)),
        townMode = this.act[me.act - 1].townMode; //此时townMode一定已经决定好了

    if (me.act === 1) {
        fireUnit = getPresetUnit(1, 2, 39);
        fire = {
            x: fireUnit.roomx * 5 + fireUnit.x,
            y: fireUnit.roomy * 5 + fireUnit.y
        };
        x = x - fire.x;
        y = y - fire.y;
    }

    // townModes = {
    //     "act1": [
    //         [
    //             {
    //                 "classId": 37,
    //                 "x": -12,
    //                 "y": -36,
    //                 "repeat": 2
    //             },
    objectList = townModes["act" + me.act][townMode.substring(4, 5) - 1];

    //print(objectList.length);

    for (i = 0; i < objectList.length; i++) {
        if (objectList[i].classId === classid && objectList[i].x == x && objectList[i].y == y && objectList[i].repeat && objectList[i].repeat > 10) { //筛选掉重复路障
            return false;
        }
    }

    return true;
};

Town.getPath = function (spot) {
    var i, typePathes,
        townMode = this.act[me.act - 1].townMode,
        mySpot = this.getNearestTownSpot();

    do {
        townMode = this.act[me.act - 1].townMode;
        delay(100);
    } while (!townMode);

    typePathes = this.pathes["act" + me.act][townMode];
    for (i = 0; i < typePathes.length; i++) {
        if (typePathes[i].from.indexOf(mySpot) > -1 && typePathes[i].to.indexOf(spot) > -1) {
            return typePathes[i].path;
        }
    }

    return false;
};

include("private-server/data/TownPathes.js"); //导入自定义路线

/*
    私服禁用城内TK
*/
Town.telekinesis = false;

/*
    重写initNPC函数 用于解决城内绕路踢桶问题
*/
Town.initNPC = function (task, reason) {
    print("initNPC: " + reason);

    var npc = getInteractedNPC();

    if (npc && npc.name.toLowerCase() !== this.tasks[me.act - 1][task]) {
        me.cancel();

        npc = null;
    }

    // Jamella gamble fix
    if (task === "Gamble" && npc && npc.name.toLowerCase() === NPC.Jamella) {
        me.cancel();

        npc = null;
    }

    /*
    if (!npc) {
        npc = getUnit(1, this.tasks[me.act - 1][task]);

        if (!npc) {
            this.move(this.tasks[me.act - 1][task]);

            npc = getUnit(1, this.tasks[me.act - 1][task]);
        }
    }
    */

    if (!npc) {
        this.move(this.tasks[me.act - 1][task]);

        npc = getUnit(1, this.tasks[me.act - 1][task]);
    }

    if (!npc || npc.area !== me.area || (!getUIFlag(0x08) && !npc.openMenu())) {
        return false;
    }

    switch (task) {
        case "Shop":
        case "Repair":
        case "Gamble":
            if (!getUIFlag(0x0C) && !npc.startTrade(task)) {
                return false;
            }

            break;
        case "Key":
            if (!getUIFlag(0x0C) && !npc.startTrade(me.act === 3 ? "Repair" : "Shop")) {
                return false;
            }

            break;
        case "CainID":
            Misc.useMenu(0x0FB4);
            me.cancel();

            break;
    }

    return npc;
};

/*
    重写openStash函数（私服禁用TK开储物箱）
*/
Town.openStash = function () {
    if (getUIFlag(0x19)) {
        return true;
    }

    var i, tick, stash,
        //telekinesis = me.classid === 1 && me.getSkill(43, 1);
        telekinesis = false; //anhei3私服禁用TK开储物箱

    for (i = 0; i < 5; i += 1) {
        this.move("stash");

        stash = getUnit(2, 267);

        if (stash) {
            if (telekinesis) {
                Skill.cast(43, 0, stash);
            } else {
                Misc.click(0, 0, stash);
                //stash.interact();
            }

            tick = getTickCount();

            while (getTickCount() - tick < 1000) {
                if (getUIFlag(0x19)) {
                    delay(200);

                    return true;
                }

                delay(10);
            }
        }

        if (i > 1) {
            Packet.flash(me.gid);

            if (stash) {
                Pather.moveToUnit(stash);
            } else {
                this.move("stash");
            }

            telekinesis = false;
        }
    }

    return false;
};

