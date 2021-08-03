/**
*	@文件名	    TownModeChecker.js
*	@作者	    Black phoen1x
*	@描述	    用于检测封包判断城镇地图类型的线程
*/

function main() {
    include("OOG.js");
    include("json2.js");
    include("common/Misc.js");
    include("common/Prototypes.js");
    include("private-server/functions/Color.js");

    D2Bot.init();

    var needCheck = true, //是否需要检查城镇地图类型（该私服城内是否有路障）
        checking = false,
        preArea;

    var packetlist = []; //封包数组

    /*
        通过封包判断地图类型
    */
    this.getTownMode = function () {
        var i, objectList = [], sameNo, townMode, sameRate,
            obj, classId, fireUnit, fire, x, y,
            savedObjectList,
            maxSameNo = 0,
            filePath = "libs/private-server/data/TownModes.json",
            townModes = JSON.parse(Misc.fileAction(filePath, 0));

        townMode = this.readTownMode();
        if (townMode) { //如果已经存在 说明已创建 则不用写
            // 告诉游戏线程和吃鸡线程TownMode
            //print("gotfromFile");
            //print(townMode);
            this.shareTownMode(townMode);
            print("TownMode: " + townMode);
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
            return false;
        }

        objectList = this.removeDuplicates(objectList);

        //对比objectList(检测到的)townModes(文件中的)

        for (i = 0; i < townModes["act" + me.act].length; i++) {
            savedObjectList = townModes["act" + me.act][i];
            sameNo = this.compareLists(objectList, savedObjectList);

            if (sameNo > maxSameNo) {
                maxSameNo = sameNo;
                townMode = "type" + (i + 1);
            }
        }

        sameRate = Math.round((maxSameNo / objectList.length) * 100) + "%";

        this.writeTownMode(townMode);

        //写完townMode之后 告诉游戏线程和吃鸡线程TownMode
        this.shareTownMode(townMode);

        print("TownMode: " + townMode + "  " + sameRate);
        return true;
    };

    this.shareTownMode = function (townMode) {
        Messaging.sendToScript("default.dbj", townMode);
        Messaging.sendToScript("libs/private-server/tools/TownChicken.js", townMode);

        return true;
    };

    this.readTownMode = function () {
        var file, fileLength, filePath, gameTownModes;
        filePath = "libs/private-server/data/GameTownModes.json";

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

        if (fileLength) {
            gameTownModes = JSON.parse(Misc.fileAction(filePath, 0));
            if (gameTownModes[me.gamename] && gameTownModes[me.gamename][me.act - 1]) {
                return gameTownModes[me.gamename][me.act - 1];
            }
        }

        return false;
    };

    this.writeTownMode = function (townMode) {
        var file, fileLength, filePath,
            gameTownModes = {},
            filePath = "libs/private-server/data/GameTownModes.json";
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

        if (fileLength) {
            gameTownModes = JSON.parse(Misc.fileAction(filePath, 0));
            for (var key in gameTownModes) {
                if (key === me.gamename) { //如果有本场游戏了(存入其他act数据)
                    this.changeFile(gameTownModes, townMode);
                    return true;
                }
            }

            //如果没有本场游戏
            gameTownModes[me.gamename] = [];
            this.changeFile(gameTownModes, townMode);
            return true;

        } else {
            // gameTownModes = {
            //     game1:[1,2,3,4,5],
            //     game2:[1,2,3,4,5]
            // }

            gameTownModes[me.gamename] = [];
            this.changeFile(gameTownModes, townMode);
            return true;
        }

        return false;
    };

    this.changeFile = function (gameTownModes, townMode) {
        var fileMsg, filePath = "libs/private-server/data/GameTownModes.json";
        gameTownModes[me.gamename][me.act - 1] = townMode;
        fileMsg = JSON.stringify(gameTownModes);
        Misc.fileAction(filePath, 1, fileMsg);

        return true;
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


    //监听并添加数据到封包数组
    this.startListen = function () {
        packetlist = [];
        addEventListener("gamepacket", function (pBytes) {
            if (pBytes[0] == 0x51) {
                packetlist.push(pBytes);
            }
        });
        print(Color.orange + "TownModeChecker" + Color.white + " :: " + Color.lgreen + "start checking");
    };

    this.stopListen = function () {
        removeEventListener("gamepacket", function (pBytes) {
            if (pBytes[0] == 0x51) {
                packetlist.push(pBytes);
            }
        });
        checking = false;
        print(Color.orange + "TownModeChecker" + Color.white + " :: " + Color.red + "stop checking");
    };

    this.scriptEvent = function (msg) {
        switch (msg) {
            case "startChecking":
                checking = true;
                this.startListen();
                scriptBroadcast("townModeChecking");
                preArea = me.gameReady ? me.area : "lobby";
                //print(preArea);

                break;
            case "stopChecking":
                this.stopListen();

                break;
        }
    };

    this.areaChanged = function () {
        return preArea === me.area ? false : true;
    }

    if (!needCheck) {
        return true; //如果不需要检测城镇地图类型则直接结束线程
    }

    addEventListener("scriptmsg", this.scriptEvent);

    print(Color.orange + "TownModeChecker" + Color.white + " :: loaded.");

    //需要改写pather的usewaypoint和useportal，如果目标在城内, 提前开启封包收集;

    //开始主循环
    while (true) {
        if (checking && me.gameReady && me.inTown && this.areaChanged()) {  //当进游戏并且在城中
            delay(1000); //等1秒收集封包
            if (!this.getTownMode()) {
                throw new Error("Cannot get townMode.");
            }
            this.stopListen();
        }

        delay(500);
    }
}