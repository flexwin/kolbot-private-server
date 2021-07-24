/**
*	@文件名	    TownModeHelper.js
*	@作者		Black phoen1x
*	@描述		用于制作城镇地图类型数据文件
*/

function main() {
    // include("OOG.js");
    // include("json2.js");
    // include("common/Misc.js");
    // include("common/Prototypes.js");
    include("private-server/functions/Color.js");
    include("json2.js");
    include("OOG.js");
    include("common/CollMap.js");
    include("common/Misc.js");
    include("common/Prototypes.js");

    D2Bot.init();

    var packetlist = [], //封包数组
        ingame = false;

    //按键事件触发函数
    this.keyEvent = function (key) {
        switch (key) {
            case 112: // F1
                this.editTownModeFile(packetlist);
                //生成townMode文件
                packetlist = []; //清空封包数组
                break;
            case 116: // F5
                if (!this.showInfo()) { //在D2Bot#控制台上显示：人物坐标，鼠标所在坐标，离鼠标最近的路障/NPC的classID和名字，当前区域ID，点起在鼠标上的物品ID
                    throw new Error("Cannot show information.");
                }
                break;
        }
    };

    /*
        填写城镇地图类型文件
    */
    this.editTownModeFile = function () {
        var i, obj,
            classId, fireUnit, fire, x, y,
            file, fileLength,
            townModes, actTownModes, fileMsg,
            objectList = [],
            filePath = "libs/private-server/data/TownModes.json";

        if (me.act === 1) {
            fireUnit = getPresetUnit(1, 2, 39);
            fire = {
                x: fireUnit.roomx * 5 + fireUnit.x,
                y: fireUnit.roomy * 5 + fireUnit.y
            };
        }

        for (i = 0; i < packetlist.length; i++) {
            classId = this.convertpBytes(packetlist[i], 6, "word");
            x = this.convertpBytes(packetlist[i], 8, "word");
            y = this.convertpBytes(packetlist[i], 10, "word");
            //如果在A1则记录相对坐标
            x = (me.act === 1) ? (x - fire.x) : x;
            y = (me.act === 1) ? (y - fire.y) : y;
            obj = {
                classId: classId,
                x: x,
                y: y
            };
            objectList.push(obj);
        }

        if (!objectList.length) {
            throw new Error("Cannot find object list.");
        }

        objectList = this.removeDuplicates(objectList);

        try {
            file = File.open(filePath, 0);
            fileLength = file.length;
        } catch (e) {
            throw new Error("Failed to open townMode File.");
        } finally {
            if (file) {
                file.close();
            }
        }

        // var townModes = {
        //     act1: [
        //         [
        //             {
        //                 classID: 123,
        //                 x: 123,
        //                 y: 123
        //             }
        //         ],
        //         [

        //         ],
        //     ]
        // }

        if (fileLength) {
            townModes = JSON.parse(Misc.fileAction(filePath, 0));
            actTownModes = townModes["act" + me.act];
            if (actTownModes) {
                townModes["act" + me.act][actTownModes.length] = objectList;
            } else {
                townModes["act" + me.act] = [objectList];
            }
        } else {
            townModes = {};
            townModes["act" + me.act] = [objectList];
        }

        fileMsg = JSON.stringify(townModes);
        Misc.fileAction(filePath, 1, fileMsg);

        //D2Bot.printToConsole("\n Successfully added townMode [" + type + "]. \n File path: [" + filePath + "]. \n Total object number: " + filePath.length, 4);

        return true;
    };

    /*
        去除数组中的重复对象
    */
    this.removeDuplicates = function (array) {
        var i, j, startLength;

        startLength = array.length;

        for (i = 0; i < array.length; i++) {
            for (j = i + 1; j < array.length;) {
                if (array[i].x === array[j].x && array[i].y === array[j].y) { //通过属性进行匹配
                    array.splice(j, 1); //去除重复的对象
                    if (array[i].repeat) { //增加重复属性
                        array[i].repeat++;
                    } else {
                        array[i].repeat = 1;
                    }
                } else {
                    j++;
                }
            }
        }

        print("removed: " + (startLength - array.length));

        return array;
    }

    /*
        转换封包数据
    */
    this.convertpBytes = function (pBytes, from, length) {
        var result;

        switch (length) {
            case 1:
            case "byte":
                result = pBytes[from] >>> 0;
                break;
            case 2:
            case "word":
                result = ((pBytes[from]) | (pBytes[from + 1] << 8)) >>> 0;
                break;
            case 4:
            case "dword":
                result = ((pBytes[from]) | (pBytes[from + 1] << 8) | (pBytes[from + 2] << 16) | (pBytes[from + 3] << 24)) >>> 0;
        }

        if (result) {
            return result;
        }

        return false;
    };

    /*
        在D2Bot#控制台上显示：人物坐标，鼠标所在坐标，离鼠标最近的路障/NPC的classID和名字，当前区域ID，点起在鼠标上的物品ID
    */
    this.showInfo = function () {
        var mouse = getMouseCoords(true, true);
        var unit, targetUnit, npc, targetNpc, range, distance;
        var cursorItem;
        var fire, fireUnit, meRelCoords, mouseRelCoords;
        var unitRelCoords, npcRelCoords;
        range = 3;

        if (me.act == 1) {
            fireUnit = getPresetUnit(1, 2, 39);
            if (!fireUnit) {
                D2Bot.printToConsole("Error: Couldn't find fire unit.", 9);
            }
            fire = {
                x: fireUnit.roomx * 5 + fireUnit.x,
                y: fireUnit.roomy * 5 + fireUnit.y
            }
            meRelCoords = {
                x: me.x - fire.x >= 0 ? "+" + (me.x - fire.x) : me.x - fire.x,
                y: me.y - fire.y >= 0 ? "+" + (me.y - fire.y) : me.y - fire.y
            }
            mouseRelCoords = {
                x: mouse.x - fire.x >= 0 ? "+" + (mouse.x - fire.x) : mouse.x - fire.x,
                y: mouse.y - fire.y >= 0 ? "+" + (mouse.y - fire.y) : mouse.y - fire.y
            }
            D2Bot.printToConsole("AreaID: [" + me.area + "] | Me: [fire" + meRelCoords.x + ", fire" + meRelCoords.y + "] | " + "Mouse: [fire" + mouseRelCoords.x + ", fire" + mouseRelCoords.y + "]", 4);
        } else {
            D2Bot.printToConsole("AreaID: [" + me.area + "] | Me: [" + me.x + ", " + me.y + "] | " + "Mouse: [" + mouse.x + ", " + mouse.y + "]", 4);
        }

        unit = getUnit(2);

        if (unit) {
            do {
                distance = getDistance(mouse.x, mouse.y, unit.x, unit.y);
                if (unit.name && distance < range) {
                    targetUnit = true;
                    break;
                }
            } while (unit.getNext());
        }

        if (unit.name && targetUnit) {
            if (me.act == 1) {
                unitRelCoords = {
                    x: unit.x - fire.x >= 0 ? "+" + (unit.x - fire.x) : unit.x - fire.x,
                    y: unit.y - fire.y >= 0 ? "+" + (unit.y - fire.y) : unit.y - fire.y
                }
                D2Bot.printToConsole("Nearest unit to cursor: " + unit.name + " [fire" + unitRelCoords.x + ", fire" + unitRelCoords.y + "] ClassID:[" + unit.classid + "]", 4);
            } else {
                D2Bot.printToConsole("Nearest unit to cursor: " + unit.name + " [" + unit.x + ", " + unit.y + "] ClassID:[" + unit.classid + "]", 4);
            }
        }

        npc = getUnit(1);

        if (npc) {
            do {
                distance = getDistance(mouse.x, mouse.y, npc.x, npc.y);
                if (npc.name && distance < range) {
                    targetNpc = true;
                    break;
                }
            } while (npc.getNext());
        }

        if (npc.name && targetNpc) {
            if (me.act == 1) {
                npcRelCoords = {
                    x: npc.x - fire.x >= 0 ? "+" + (npc.x - fire.x) : npc.x - fire.x,
                    y: npc.y - fire.y >= 0 ? "+" + (npc.y - fire.y) : npc.y - fire.y
                }
                D2Bot.printToConsole("Nearest npc to cursor: " + npc.name + " [fire" + npcRelCoords.x + ", fire" + npcRelCoords.y + "] ClassID:[" + npc.classid + "]", 4);
            } else {
                D2Bot.printToConsole("Nearest npc to cursor: " + npc.name + " [" + npc.x + ", " + npc.y + "] ClassID:[" + npc.classid + "]", 4);
            }
        }

        cursorItem = getUnit(100);
        if (cursorItem) {
            D2Bot.printToConsole("Current Item: " + cursorItem.name + " [classid = " + cursorItem.classid + "] | [lv = " + cursorItem.ilvl + "]", 4);
        }
        return true;
    };

    //监听并添加数据到封包数组
    addEventListener("gamepacket", function (pBytes) {
        if (pBytes[0] == 0x51) {
            packetlist.push(pBytes);
        }
    });

    addEventListener("keyup", this.keyEvent);

    print(Color.orange + "TownModeHelper" + Color.white + " :: loaded.");

    //开始主循环
    while (true) {

        if (!me.ingame) {
            if (ingame) { //退出游戏了
                ingame = false;
                packetlist = []; //清空封包数组
            }
        }

        if ((me.ingame && me.inTown)) {
            if (!ingame) {
                ingame = true;
                print(Color.orange + "TownModeHelper" + Color.white + " :: Press " + Color.lgold + "F1 " + Color.white + "to add townMode File, " + Color.lgold + "F5 " + Color.white + "to show information.");
            }
        }

        delay(20);
    }
}