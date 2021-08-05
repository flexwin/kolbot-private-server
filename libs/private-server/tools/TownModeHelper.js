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

    ControlAction.click = function (type, x, y, xsize, ysize, targetx, targety) { //去除打印
        var control = getControl(type, x, y, xsize, ysize);

        if (!control) {
            //print("control not found " + type + " " + x + " " + y + " location " + getLocation());

            return false;
        }

        control.click(targetx, targety);

        return true;
    };


    D2Bot.init();

    var packetlist = [], //封包数组
        ingame = false,
        findingDiffRoom = false;

    //按键事件触发函数
    this.keyEvent = function (key) {
        switch (key) {
            case 112: // F1
                this.editTownModeFile(packetlist);
                //生成townMode文件
                break;
            case 113: //F2
                findingDiffRoom = !findingDiffRoom;
                if (findingDiffRoom) {
                    D2Bot.printToConsole("Finding room...... Press F2 to stop.", 4);
                }
                break;

            case 114:
                this.checkRoom();
                break;

            case 115: //F4
                this.removeTownMode();
                break;
            case 116: // F5
                if (!this.showInfo()) { //在D2Bot#控制台上显示：人物坐标，鼠标所在坐标，离鼠标最近的路障/NPC的classID和名字，当前区域ID，点起在鼠标上的物品ID
                    throw new Error("Cannot show information.");
                }
                break;
        }
    };

    this.getNextRoom = function () {
        Messaging.sendToScript("tools/ToolsThread.js", "quit");

        while (!getLocation() === 1) {
            delay(50);
        }

        delay(500);

        while (!ControlAction.click(6, 533, 469, 120, 20)) { // Create
            delay(500);
        }

        while (!getLocation() === 4) {
            delay(50);
        }

        delay(500);

        //到了大厅后 随机建立房间
        ControlAction.createGame(this.randomWord(true, 5, 10), "1", "Highest", false);

        return true;
    };

    this.checkRoom = function () {
        var i, objectList = [], sameNo, maxSameNo = 0, similarType, sameRate,
            obj, classId, fireUnit, fire, x, y,
            savedObjectList,
            filePath = "libs/private-server/data/TownModes.json",
            townModes = JSON.parse(Misc.fileAction(filePath, 0));

        if (townModes["act" + me.act].length === 0) {
            findingDiffRoom = false;
            return true;
        }

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
            print("!!");
            return false;
        }

        objectList = this.removeDuplicates(objectList);

        //对比objectList(检测到的)townModes(文件中的)

        for (i = 0; i < townModes["act" + me.act].length; i++) {
            savedObjectList = townModes["act" + me.act][i];
            sameNo = this.compareLists(objectList, savedObjectList);
            if (findingDiffRoom && sameNo === objectList.length) { //如果重复率为100%
                this.getNextRoom();
                return true;
            }
            if (sameNo > maxSameNo) {
                maxSameNo = sameNo;
                similarType = "type" + (i + 1);
            }
        }

        sameRate = Math.round((maxSameNo / objectList.length) * 100) + "%";

        if (findingDiffRoom) {
            D2Bot.printToConsole("Room Found. Similar townMode: " + similarType + "  " + sameRate, 4);//打印最相似的地图类型和相似律
            findingDiffRoom = false; //如果没有重复率为100%的 则停止
        } else {
            if (sameRate === "100%") {
                D2Bot.printToConsole("Current Room: " + similarType, 4);
            } else {
                D2Bot.printToConsole("Current Room: None. Similar Type: " + similarType + "  " + sameRate, 4);//打印最相似的地图类型和相似律
            }
        }

        return true;
    };

    this.randomWord = function (randomFlag, min, max) {
        var str = "",
            range = min,
            arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

        // 随机产生
        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        var pos;
        for (var i = 0; i < range; i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    };

    /*
        比较2个数组中的对象，返回相同的数量
    */
    this.compareLists = function (arr1, arr2) {
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

        D2Bot.printToConsole("Added: type" + townModes["act" + me.act].length, 4);

        return true;
    };

    this.removeTownMode = function () {
        var fileMsg,
            filePath = "libs/private-server/data/TownModes.json",
            townModes = JSON.parse(Misc.fileAction(filePath, 0)),
            i = townModes["act" + me.act].length;

        if (i) {
            townModes["act" + me.act].splice(i - 1, 1);
            fileMsg = JSON.stringify(townModes);
            Misc.fileAction(filePath, 1, fileMsg);
            D2Bot.printToConsole("Removed: type" + i, 4);
        }

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

        //print("removed: " + (startLength - array.length));

        return array;
    };

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

        print(fire.x + "   " + fire.y);

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

        if ((me.gameReady && me.inTown)) {
            if (!ingame) {
                ingame = true;
                print(Color.orange + "TownModeHelper" + Color.white + " :: Press " + Color.lgold + "F1 " + Color.white + "to add townMode File, " + Color.lgold + "F5 " + Color.white + "to show information.");
                print(Color.orange + "TownModeHelper" + Color.white + " :: Press " + Color.lgold + "F2 " + Color.white + "to get different room, " + Color.lgold + "F4 " + Color.white + "to delete last townMode.");
            }
            if (findingDiffRoom) {
                //print("finding");
                delay(1000);
                this.checkRoom();
            }
        }

        delay(20);
    }
}