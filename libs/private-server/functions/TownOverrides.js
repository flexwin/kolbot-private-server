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
                if (name === NPC.Hratli && townSpot[i] === 5127 && townSpot[i + 1] === 5172) { //将Hratli改为meshif
                    name = "meshif";
                }
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
            if (this.existBarriers) {
                path = this.getPath(spot);
                if (path) {
                    this.followPath(path);
                    Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, false);
                } else {
                    Pather.moveTo(townSpot[i], townSpot[i + 1], 3, false, (spot === "exit" ? false : true));
                }
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
            case "exit":
                if (getDistance(me, townSpot[i], townSpot[i + 1]) < 10) {
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
        if (path[i].useTpPad) {
            if (!this.useTpPad(5)) {
                print("Failed to use TpPad!")
            }
        }
    }

    return true;
};

Town.getTpPad = function (range) {
    var tpPad = getUnit(2, "teleportation pad");

    if (tpPad) {
        do {
            if (getDistance(me, tpPad) <= range) {
                return (copyUnit(tpPad));
            }
        } while (tpPad.getNext());
    }

    return false;
};

Town.useTpPad = function (range) {
    me.cancel();

    var i, tick, tpPad,
        preArea = { x: me.x, y: me.y };

    for (i = 0; i < 10; i += 1) {
        tpPad = this.getTpPad(range);

        if (tpPad) {
            if (i < 2) {
                sendPacket(1, 0x13, 4, 0x2, 4, tpPad.gid);
            } else {
                Misc.click(0, 0, tpPad);
            }

            tick = getTickCount();

            while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
                if (getDistance(me.x, me.y, preArea.x, preArea.y) > 5) {
                    delay(100);

                    return true;
                }

                delay(10);
            }

            if (i > 1) {
                Packet.flash(me.gid);
            }
        } else {
            Packet.flash(me.gid);
        }

        delay(200 + me.ping);
    }

    return false;
};

Town.openChests = function (range, times) {
    var unit,
        unitList = [],
        containers = [
            "chest", "loose rock", "hidden stash", "loose boulder", "corpseonstick", "casket", "armorstand", "weaponrack", "barrel", "holeanim", "tomb2",
            "tomb3", "roguecorpse", "ratnest", "corpse", "goo pile", "largeurn", "urn", "chest3", "jug", "skeleton", "guardcorpse", "sarcophagus", "object2",
            "cocoon", "basket", "stash", "hollow log", "hungskeleton", "pillar", "skullpile", "skull pile", "jar3", "jar2", "jar1", "bonechest", "woodchestl",
            "woodchestr", "barrel wilderness", "burialchestr", "burialchestl", "explodingchest", "chestl", "chestr", "groundtomb", "icecavejar1", "icecavejar2",
            "icecavejar3", "icecavejar4", "deadperson", "deadperson2", "evilurn", "tomb1l", "tomb3l", "groundtombl", "crate"
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

Town.compareLists = function (arr1, arr2) {
    var i, j,
        sameNo = 0;

    for (i = 0; i < arr1.length; i++) {
        for (j = 0; j < arr2.length; j++) {
            if (arr1[i].x === arr2[j].x && arr1[i].y === arr2[j].y && arr1[i].classId === arr2[j].classId) {
                sameNo++;
            }
        }
    }
    return sameNo;
};

Town.checkTownMode = function () {
    var i, unit, objectList = [], sameNo, townMode, sameRate,
        fireUnit, fire,
        savedObjectList,
        maxSameNo = 0,
        filePath = "libs/private-server/data/TownModes.json",
        townModes = JSON.parse(Misc.fileAction(filePath, 0));


    if (me.act === 1) {
        fireUnit = getPresetUnit(1, 2, 39);
        fire = {
            x: fireUnit.roomx * 5 + fireUnit.x,
            y: fireUnit.roomy * 5 + fireUnit.y
        };
    }

    unit = getUnit(2);
    if (unit) {
        objectList.push({
            x: me.act === 1 ? unit.x - fire.x : unit.x,
            y: me.act === 1 ? unit.y - fire.y : unit.y,
            classId: unit.classid
        })

        do {
            for (i = 0; i < objectList.length; i++) {
                if (!(objectList[i].x === unit.x && objectList[i].y === unit.y && objectList[i].classid === unit.classid)) { //不同坐标即添加
                    objectList.push({
                        x: me.act === 1 ? unit.x - fire.x : unit.x,
                        y: me.act === 1 ? unit.y - fire.y : unit.y,
                        classId: unit.classid
                    });
                    break;
                }
            }
        } while (unit.getNext())
    }

    for (i = 0; i < townModes["act" + me.act].length; i++) {
        savedObjectList = townModes["act" + me.act][i];
        sameNo = this.compareLists(objectList, savedObjectList);

        if (sameNo > maxSameNo) {
            maxSameNo = sameNo;
            townMode = "type" + (i + 1);
        }
    }

    sameRate = Math.round((maxSameNo / objectList.length) * 100) + "%";

    print("TownMode: " + townMode + "  " + sameRate);

    return townMode;
};

Town.initialize = function () {
    //print("Initialize town " + me.act);

    switch (me.act) {
        case 1:
            var fire,
                wp = getPresetUnit(1, 2, 119),
                fireUnit = getPresetUnit(1, 2, 39);

            if (!fireUnit) {
                return false;
            }

            fire = [fireUnit.roomx * 5 + fireUnit.x, fireUnit.roomy * 5 + fireUnit.y];

            this.act[0].spot = {};
            this.act[0].spot.stash = [fire[0] - 7, fire[1] - 12];
            this.act[0].spot.warriv = [fire[0] - 5, fire[1] - 2];
            this.act[0].spot.cain = [fire[0] + 6, fire[1] - 5];
            this.act[0].spot[NPC.Kashya] = [fire[0] + 14, fire[1] - 4];
            this.act[0].spot[NPC.Akara] = [fire[0] + 56, fire[1] - 30];
            this.act[0].spot[NPC.Charsi] = [fire[0] - 39, fire[1] - 25];
            this.act[0].spot[NPC.Gheed] = [fire[0] - 34, fire[1] + 36];
            this.act[0].spot.portalspot = [fire[0] + 10, fire[1] + 18];
            this.act[0].spot.waypoint = [wp.roomx * 5 + wp.x, wp.roomy * 5 + wp.y];
            this.act[0].initialized = true;

            break;
        case 2:
            this.act[1].spot = {};
            this.act[1].spot[NPC.Fara] = [5124, 5082];
            this.act[1].spot.cain = [5124, 5082];
            this.act[1].spot[NPC.Lysander] = [5118, 5104];
            this.act[1].spot[NPC.Greiz] = [5033, 5053];
            this.act[1].spot[NPC.Elzix] = [5032, 5102];
            this.act[1].spot.palace = [5088, 5153];
            this.act[1].spot.sewers = [5221, 5181];
            this.act[1].spot.meshif = [5205, 5058];
            this.act[1].spot[NPC.Drognan] = [5097, 5035];
            this.act[1].spot.atma = [5137, 5060];
            this.act[1].spot.warriv = [5152, 5201];
            this.act[1].spot.portalspot = [5168, 5060];
            this.act[1].spot.stash = [5124, 5076];
            this.act[1].spot.waypoint = [5070, 5083];
            this.act[1].initialized = true;

            break;
        case 3:
            this.act[2].spot = {};
            this.act[2].spot.meshif = [5118, 5168];
            this.act[2].spot[NPC.Hratli] = [5223, 5048, 5127, 5172];
            this.act[2].spot[NPC.Ormus] = [5129, 5093];
            this.act[2].spot[NPC.Asheara] = [5043, 5093];
            this.act[2].spot[NPC.Alkor] = [5083, 5016];
            this.act[2].spot.cain = [5148, 5066];
            this.act[2].spot.stash = [5144, 5059];
            this.act[2].spot.portalspot = [5150, 5063];
            this.act[2].spot.waypoint = [5158, 5050];
            this.act[2].initialized = true;

            break;
        case 4:
            this.act[3].spot = {};
            this.act[3].spot.cain = [5027, 5027];
            this.act[3].spot[NPC.Halbu] = [5089, 5031];
            this.act[3].spot[NPC.Tyrael] = [5027, 5027];
            this.act[3].spot[NPC.Jamella] = [5088, 5054];
            this.act[3].spot.stash = [5022, 5040];
            this.act[3].spot.portalspot = [5045, 5042];
            this.act[3].spot.waypoint = [5043, 5018];
            this.act[3].initialized = true;

            break;
        case 5:
            this.act[4].spot = {};
            this.act[4].spot.portalspot = [5098, 5019];
            this.act[4].spot.stash = [5129, 5061];
            this.act[4].spot[NPC.Larzuk] = [5141, 5045];
            this.act[4].spot[NPC.Malah] = [5078, 5029];
            this.act[4].spot.cain = [5119, 5061];
            this.act[4].spot[NPC["Qual-Kehk"]] = [5066, 5083];
            this.act[4].spot[NPC.Anya] = [5112, 5120];
            this.act[4].spot.portal = [5118, 5120];
            this.act[4].spot.waypoint = [5113, 5068];
            this.act[4].spot.nihlathak = [5071, 5111];
            this.act[4].initialized = true;

            break;
    }

    if (Town.existBarriers) {
        Town.act[me.act - 1].townMode = this.checkTownMode();
    }

    return true;
};

Town.getPath = function (spot) {
    var i, typePathes,
        townMode = this.act[me.act - 1].townMode,
        mySpot = this.getNearestTownSpot();

    print("From: " + Color.lgreen + mySpot + Color.white + ", To: " + Color.lgreen + spot);

    if (!townMode) {
        throw new Error("Cannot find townMode!");
    }

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

//添加自动回收

Town.doChores = function () {
    if (!me.inTown) {
        this.goToTown();
    }

    var i,
        cancelFlags = [0x01, 0x02, 0x04, 0x08, 0x14, 0x16, 0x0c, 0x0f, 0x19, 0x1a];

    if (me.classid === 4 && Config.FindItem && Config.FindItemSwitch) { // weapon switch fix in case last game dropped with item find switch on
        Precast.weaponSwitch(Math.abs(Config.FindItemSwitch - 1));
    }

    if (Config.MFSwitchPercent) {
        Precast.weaponSwitch(Math.abs(Config.MFSwitch - 1));
    }

    if (Precast.haveCTA > -1) {
        Precast.weaponSwitch(Math.abs(Precast.haveCTA - 1));
    }

    this.heal();
    this.identify();
    this.shopItems();
    this.fillTome(518);

    if (Config.FieldID) {
        this.fillTome(519);
    }

    this.buyPotions();
    this.clearInventory();
    Item.autoEquip();
    this.buyKeys();
    this.repair();
    this.gamble();
    Recycle.doRecycle(); //加入自动回收
    this.reviveMerc();
    Cubing.doCubing();
    Runewords.makeRunewords();
    this.stash(true);
    this.clearScrolls();

    for (i = 0; i < cancelFlags.length; i += 1) {
        if (getUIFlag(cancelFlags[i])) {
            delay(500);
            me.cancel();

            break;
        }
    }

    me.cancel();

    return true;
};

