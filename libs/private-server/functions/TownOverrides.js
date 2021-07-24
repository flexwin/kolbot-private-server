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
}

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
            if (path) {
                this.followPath(path);
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
}

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
}

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
            if (this.validChest(unit.x, unit.y) &&
                unit.name && unit.mode === 0 && getDistance(me.x, me.y, unit.x, unit.y) <= range && containers.indexOf(unit.name.toLowerCase()) > -1) {
                unitList.push(copyUnit(unit));
            }
        } while (unit.getNext());
    }

    while (times > 0) {
        unitList.sort(Sort.units);

        unit = unitList.shift();

        times--;

        if (unit && (Pather.useTeleport || !checkCollision(me, unit, 0x4)) && Misc.openChest(unit)) {
            //Pickit.pickItems();
        }
    }

    return true;
}

Town.validChest = function (x, y) {
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

    for (i = 0; i < objectList.length; i++) {
        if (objectList[i].x === x && objectList[i].y === y) {
            return (!objectList[i].repeat || objectList[i].repeat < 10) ? true : false;
        }
    }

    return false;
}

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
}

Town.pathes = {
    act1: {
        /**
        *	@示例 myspot为起点，spot为终点，x,y为路线节点相对火堆的坐标，breakBarrier为此节点踢捅次数，如不需踢则可以不写
        	
            //地图类型：type1
            type1: [
                //所有地方去小站 [fire+27, fire-40]
                {
                    from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                    to: ["waypoint"],
                    path: [
                        {
                            x: 27,
                            y: - 36,
                        },
                        {
                            x: 27,
                            y: - 40,
                            breakBarrier: 6
                        }
                    ]
                },
                //所有地方去出口（除了小站）
                {
                    from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                    to: ["exit"],
                    path: [
                        {
                            x: 82,
                            y: 0,
                            breakBarrier: 3
                        }
                    ]
                },
            ],
    
            type2: [ ...
        */

        //地图类型：出口左上
        type1: [
            //所有地方去小站 [fire+27, fire-40]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 27,
                        y: - 40,
                        breakBarrier: 6
                    }
                ]
            },
            //小站去所有地方[fire+22, fire-38]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 22,
                        y: - 38,
                        breakBarrier: 6
                    },
                    {
                        x: 27,
                        y: - 40
                    }
                ]
            }
        ],

        //地图类型：出口右下
        type2: [
            //所有地方去小站 [fire+26, fire-25]	
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 26,
                        y: - 25,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方 [fire+24, fire-28]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 4
                    },
                    {
                        x: 26,
                        y: - 25
                    }
                ]
            },
            //所有地方去出口
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["exit"],
                path: [
                    {
                        x: 82,
                        y: 0,
                        breakBarrier: 3
                    }
                ]
            },
            //小站去出口
            {
                from: ["waypoint"],
                to: ["exit"],
                path: [
                    {
                        x: 24,
                        y: - 28,
                        breakBarrier: 4
                    },
                    {
                        x: 26,
                        y: - 25
                    },
                    {
                        x: 82,
                        y: 0,
                        breakBarrier: 3
                    }
                ]
            },
        ],

        //地图类型：出口左下，封传送门
        type3: [
            //所有地方去小站(除了传送门) [fire-21, fire-34]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                to: ["waypoint"],
                path: [
                    {
                        x: - 21,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了传送门) [fire-22, fire-39]  [fire-21, fire-30] 
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                path: [
                    {
                        x: 22,
                        y: - 29,
                        breakBarrier: 4
                    },
                    {
                        x: 24,
                        y: - 24
                    }
                ]
            },
            //所有地方去传送门(除了小站)  [fire+12, fire+11] 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                to: ["portalspot"],
                path: [
                    {
                        x: 12,
                        y: 11,
                        breakBarrier: 3
                    }
                ]
            },
            //传送门去所有地方(除了小站) [fire+15, fire+18] [fire+12, fire+11] 
            {
                from: ["portalspot"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed],
                path: [
                    {
                        x: 15,
                        y: 18,
                        breakBarrier: 3
                    },
                    {
                        x: 12,
                        y: 11
                    }
                ]
            },
            //传送门去小站
            {
                from: ["portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: 15,
                        y: 18,
                        breakBarrier: 3
                    },
                    {
                        x: 12,
                        y: 11
                    },
                    {
                        x: - 21,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去传送门
            {
                from: ["waypoint"],
                to: ["portalspot"],
                path: [
                    {
                        x: 22,
                        y: - 29,
                        breakBarrier: 4
                    },
                    {
                        x: 24,
                        y: - 24
                    },
                    {
                        x: 12,
                        y: 11,
                        breakBarrier: 3
                    }
                ]
            }
        ],

        //地图类型：出口右上，封阿卡拉
        type4: [
            //所有地方去小站(除了阿卡拉) 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了阿卡拉) 
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    }
                ]
            },
            //所有地方去阿卡拉(除了小站)  [fire+47, fire-26]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: [NPC.Akara],
                path: [
                    {
                        x: 48,
                        y: - 27,
                        breakBarrier: 4
                    }
                ]
            },
            //阿卡拉去所有地方(除了小站)  [fire+15, fire-52]
            {
                from: [NPC.Akara],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 15,
                        y: - 52
                    }
                ]
            },
            //阿卡拉去小站
            {
                from: [NPC.Akara],
                to: ["waypoint"],
                path: [
                    {
                        x: 15,
                        y: - 52
                    },
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去阿卡拉
            {
                from: ["waypoint"],
                to: [NPC.Akara],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    },
                    {
                        x: 48,
                        y: - 27,
                        breakBarrier: 4
                    }
                ]
            }
        ],

        //地图类型：出口左下，封阿卡拉
        type5: [
            //所有地方去小站(除了阿卡拉) [fire-11, fire-34]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 11,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方(除了阿卡拉) [fire-7, fire-35]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: - 7,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 11,
                        y: - 34
                    }
                ]
            },
            //所有地方去阿卡拉(除了小站)  [fire+47, fire-26] 
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                to: [NPC.Akara],
                path: [
                    {
                        x: 38,
                        y: - 19,
                        breakBarrier: 4
                    }
                ]
            },
            //阿卡拉去所有地方(除了小站)  [fire+15, fire-52]
            {
                from: [NPC.Akara],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Charsi, NPC.Gheed, "portalspot"],
                path: [
                    {
                        x: 35,
                        y: - 25,
                        breakBarrier: 4  //踢捅以防万一传送门开在了阿卡拉身边
                    },
                    {
                        x: 38,
                        y: - 19
                    }
                ]
            },
            //阿卡拉去小站
            {
                from: [NPC.Akara],
                to: ["waypoint"],
                path: [
                    {
                        x: 35,
                        y: - 25,
                        breakBarrier: 4 //踢捅以防万一传送门开在了阿卡拉身边
                    },
                    {
                        x: 38,
                        y: - 19
                    },
                    {
                        x: - 11,
                        y: - 34,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去阿卡拉
            {
                from: ["waypoint"],
                to: [NPC.Akara],
                path: [
                    {
                        x: - 7,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 11,
                        y: - 34
                    },
                    {
                        x: 38,
                        y: - 19,
                        breakBarrier: 4
                    }
                ]
            }
        ],

        //地图类型：出口右上 不封阿卡拉
        type6: [
            //所有地方去小站 [fire-24, fire-32]
            {
                from: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot", "waypoint"],
                to: ["waypoint"],
                path: [
                    {
                        x: - 24,
                        y: - 32,
                        breakBarrier: 4
                    }
                ]
            },
            //小站去所有地方 [fire-29, fire-35]
            {
                from: ["waypoint"],
                to: ["stash", "warriv", "cain", NPC.Kashya, NPC.Akara, NPC.Charsi, NPC.Gheed, "portalspot", "waypoint"],
                path: [
                    {
                        x: - 29,
                        y: - 35,
                        breakBarrier: 4
                    },
                    {
                        x: - 24,
                        y: - 32
                    }
                ]
            }
        ],
    },
};