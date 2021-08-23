//改写读取nip方法
NTIP.ParseLineInt = function (input, info) {
    var i, property, p_start, p_end, p_section, p_keyword, p_result, value;

    p_end = input.indexOf("//");

    if (p_end !== -1) {
        input = input.substring(0, p_end);
    }

    input = input.replace(/\s+/g, "").toLowerCase();

    if (input.length < 5) {
        return null;
    }

    p_result = input.split("#");

    if (p_result[0] && p_result[0].length > 4) {
        p_section = p_result[0].split("[");

        p_result[0] = p_section[0];

        for (i = 1; i < p_section.length; i += 1) {
            p_end = p_section[i].indexOf("]") + 1;
            property = p_section[i].substring(0, p_end - 1);

            switch (property) {
                case 'color':
                    p_result[0] += "item.getColor()";

                    break;
                case 'type':
                    p_result[0] += "item.itemType";

                    break;
                case 'name':
                    p_result[0] += "item.classid";

                    break;
                case 'class':
                    p_result[0] += "item.itemclass";

                    break;
                case 'quality':
                    p_result[0] += "item.quality";

                    break;
                case 'flag':
                    if (p_section[i][p_end] === '!') {
                        p_result[0] += "!item.getFlag(";
                    } else {
                        p_result[0] += "item.getFlag(";
                    }

                    p_end += 2;

                    break;
                case 'level':
                    p_result[0] += "item.ilvl";

                    break;
                case 'prefix':
                    if (p_section[i][p_end] === '!') {
                        p_result[0] += "!item.getPrefix(";
                    } else {
                        p_result[0] += "item.getPrefix(";
                    }

                    p_end += 2;

                    break;
                case 'suffix':
                    if (p_section[i][p_end] === '!') {
                        p_result[0] += "!item.getSuffix(";
                    } else {
                        p_result[0] += "item.getSuffix(";
                    }

                    p_end += 2;

                    break;
                default:
                    Misc.errorReport("Unknown property: " + property + " File: " + info.file + " Line: " + info.line);

                    return false;
            }

            for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
                if (!NTIP.IsSyntaxInt(p_section[i][p_end])) {
                    break;
                }
            }

            p_result[0] += p_section[i].substring(p_start, p_end);

            if (p_section[i].substring(p_start, p_end) === "=") {
                Misc.errorReport("Unexpected = at line " + info.line + " in " + info.file);

                return false;
            }

            for (p_start = p_end; p_end < p_section[i].length; p_end += 1) {
                if (NTIP.IsSyntaxInt(p_section[i][p_end])) {
                    break;
                }
            }

            p_keyword = p_section[i].substring(p_start, p_end);

            if (isNaN(p_keyword)) {
                switch (property) {
                    case 'color':
                        if (NTIPAliasColor[p_keyword] === undefined) {
                            Misc.errorReport("Unknown color: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasColor[p_keyword];

                        break;
                    case 'type':
                        if (NTIPAliasType[p_keyword] === undefined) {
                            Misc.errorReport("Unknown type: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasType[p_keyword];

                        break;
                    case 'name':
                        if (NTIPAliasClassID[p_keyword] === undefined) {
                            Misc.errorReport("Unknown name: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasClassID[p_keyword];

                        break;
                    case 'class':
                        if (NTIPAliasClass[p_keyword] === undefined) {
                            Misc.errorReport("Unknown class: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasClass[p_keyword];

                        break;
                    case 'quality':
                        if (NTIPAliasQuality[p_keyword] === undefined) {
                            Misc.errorReport("Unknown quality: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasQuality[p_keyword];

                        break;
                    case 'flag':
                        if (NTIPAliasFlag[p_keyword] === undefined) {
                            Misc.errorReport("Unknown flag: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                            return false;
                        }

                        p_result[0] += NTIPAliasFlag[p_keyword] + ")";

                        break;
                    case 'prefix':
                    case 'suffix':
                        p_result[0] += "\"" + p_keyword + "\")";

                        break;
                }
            } else {
                if (property === 'flag' || property === 'prefix' || property === 'suffix') {
                    p_result[0] += p_keyword + ")";
                } else {
                    p_result[0] += p_keyword;
                }
            }

            p_result[0] += p_section[i].substring(p_end);
        }
    } else {
        p_result[0] = "";
    }

    if (p_result[1] && p_result[1].length > 4) {
        p_section = p_result[1].split("[");
        p_result[1] = p_section[0];

        for (i = 1; i < p_section.length; i += 1) {
            p_end = p_section[i].indexOf("]");
            p_keyword = p_section[i].substring(0, p_end);

            if (isNaN(p_keyword)) {
                if (NTIPAliasStat[p_keyword] === undefined) {
                    Misc.errorReport("Unknown stat: " + p_keyword + " File: " + info.file + " Line: " + info.line);

                    return false;
                }

                p_result[1] += "item.getStatEx(" + NTIPAliasStat[p_keyword] + ")";
            } else {
                p_result[1] += "item.getStatEx(" + p_keyword + ")";
            }

            p_result[1] += p_section[i].substring(p_end + 1);
        }
    } else {
        p_result[1] = "";
    }

    if (p_result[2] && p_result[2].length > 0) {
        p_section = p_result[2].split("[");
        p_result[2] = {};

        for (i = 1; i < p_section.length; i += 1) {
            p_end = p_section[i].indexOf("]");
            p_keyword = p_section[i].substring(0, p_end);

            switch (p_keyword.toLowerCase()) {
                case "maxquantity":
                    value = Number(p_section[i].split("==")[1].match(/\d+/g));

                    if (!isNaN(value)) {
                        p_result[2].MaxQuantity = value;
                    }

                    break;
                case "tier":
                    value = Number(p_section[i].split("==")[1].match(/\d+/g));

                    if (!isNaN(value)) {
                        p_result[2].Tier = value;
                    }

                    break;
                case "recycle":
                    value = Number(p_section[i].split("==")[1].replace(/\s+/g, ""));

                    if (!isNaN(value)) {
                        p_result[2].Recycle = value;
                    }

                    break;
                default:
                    Misc.errorReport("Unknown 3rd part keyword: " + p_keyword.toLowerCase());

                    return false;
            }
        }
    }

    return p_result;
};

var Recycle = {
    checkRecycle: function (item, entryList, verbose) {
        var i, list, identified, num,
            rval = {},
            result = 0;

        if (!entryList) {
            list = NTIP_CheckList;
        } else {
            list = entryList;
        }

        identified = item.getFlag(0x10);

        for (i = 0; i < list.length; i += 1) {
            try {
                if (list[i][2] && list[i][2].Recycle && !isNaN(list[i][2].Recycle)) {
                    if (list[i][0].length > 0) {
                        if (eval(list[i][0])) {
                            if (list[i][1].length > 0) {
                                if (eval(list[i][1])) {
                                    if (list[i][2] && list[i][2].MaxQuantity && !isNaN(list[i][2].MaxQuantity)) {
                                        num = NTIP.CheckQuantityOwned(list[i][0], list[i][1]);

                                        if (num < list[i][2].MaxQuantity) {
                                            result = list[i][2].Recycle;

                                            break;
                                        } else {
                                            if (item.getParent() && item.getParent().name === me.name && item.mode === 0 && num === list[i][2].MaxQuantity) { // attempt at inv fix for maxquantity
                                                result = list[i][2].Recycle;

                                                break;
                                            }
                                        }
                                    } else {
                                        result = list[i][2].Recycle;

                                        break;
                                    }
                                } else if (!identified && result === 0) {
                                    result = -1;

                                    if (verbose) {
                                        rval.line = stringArray[i].file + " #" + stringArray[i].line;
                                    }
                                }
                            } else {
                                if (list[i][2] && list[i][2].MaxQuantity && !isNaN(list[i][2].MaxQuantity)) {
                                    num = NTIP.CheckQuantityOwned(list[i][0], null);

                                    if (num < list[i][2].MaxQuantity) {
                                        result = list[i][2].Recycle;

                                        break;
                                    } else {
                                        if (item.getParent() && item.getParent().name === me.name && item.mode === 0 && num === list[i][2].MaxQuantity) { // attempt at inv fix for maxquantity
                                            result = list[i][2].Recycle;

                                            break;
                                        }
                                    }
                                } else {
                                    result = list[i][2].Recycle;

                                    break;
                                }
                            }
                        }
                    } else if (list[i][1].length > 0) {
                        if (eval(list[i][1])) {
                            if (list[i][2] && list[i][2].MaxQuantity && !isNaN(list[i][2].MaxQuantity)) {
                                num = NTIP.CheckQuantityOwned(null, list[i][1]);

                                if (num < list[i][2].MaxQuantity) {
                                    result = list[i][2].Recycle;

                                    break;
                                } else {
                                    if (item.getParent() && item.getParent().name === me.name && item.mode === 0 && num === list[i][2].MaxQuantity) { // attempt at inv fix for maxquantity
                                        result = list[i][2].Recycle1;

                                        break;
                                    }
                                }
                            } else {
                                result = list[i][2].Recycle;

                                break;
                            }
                        } else if (!identified && result === 0) {
                            result = -1;

                            if (verbose) {
                                rval.line = stringArray[i].file + " #" + stringArray[i].line;
                            }
                        }
                    }
                }
            } catch (pickError) {
                showConsole();

                if (!entryList) {
                    Misc.errorReport("ÿc1Pickit error! Line # ÿc2" + stringArray[i].line + " ÿc1Entry: ÿc0" + stringArray[i].string + " (" + stringArray[i].file + ") Error message: " + pickError.message + " Trigger item: " + item.fname.split("\n").reverse().join(" "));

                    NTIP_CheckList[i] = ["", "", ""]; // make the bad entry blank
                } else {
                    Misc.errorReport("ÿc1Pickit error in runeword config!");
                }

                result = 0;
            }
        }

        if (verbose) {
            switch (result) {
                case -1:
                    break;
                case 1:
                    rval.line = stringArray[i].file + " #" + stringArray[i].line;

                    break;
                default:
                    rval.line = null;

                    break;
            }

            rval.result = result;

            return rval;
        }

        return result;
    },

    recycleItems: [],
    recycleItemSets: [],

    initRecycleList: function () {
        Recycle.recycleItems = [];
        Recycle.recycleItemSets = [];
        return true;
    },

    buildRecycleList: function () {
        var i, j, result1, result2, itemList, recycleCount = 0, itemSet = [], setClassId = [];
        this.initRecycleList();

        itemList = me.findItems();

        for (i = 0; i < itemList.length; i++) {
            result1 = this.checkRecycle(itemList[i]);
            if ([3, 7].indexOf(itemList[i].location) > -1 && result1 === 1) {
                this.recycleItems.push(copyUnit(itemList[i]));
                itemList.splice(i, 1);
                i -= 1;
                recycleCount++;
            }

            if ([3, 7].indexOf(itemList[i].location) > -1 && result1 > 1) {
                itemSet = [];
                setClassId = [];

                itemSet.push(copyUnit(itemList[i]));
                setClassId.push(itemList[i].classid);

                for (j = i + 1; j < itemList.length; j++) {
                    result2 = this.checkRecycle(itemList[j]);
                    if ([3, 7].indexOf(itemList[j].location) > -1 && result2 === result1 && setClassId.indexOf(itemList[j].classid) === -1) {
                        itemSet.push(copyUnit(itemList[j]));
                        setClassId.push(itemList[j].classid);
                        itemList.splice(j, 1);
                        j -= 1;
                    }
                }

                if (itemSet.length >= 2) {
                    this.recycleItemSets.push(itemSet);
                    itemList.splice(i, 1);
                    i -= 1;
                    recycleCount++;
                }
            }
        }
        return true;
    },

    getRecyclePotion: function (npc) {
        var item, recyclePotion;

        item = npc.getItem();

        do {
            if (this.checkRecycle(item) === -2) {
                recyclePotion = item;
                break;
            }
        } while (item.getNext())

        return recyclePotion;
    },

    buyRecyclePotions: function () {
        if (!Storage.Inventory.CanFit({ sizex: 1, sizey: 1 }) && AutoMule.getMuleItems().length > 0) {
            D2Bot.printToConsole("Mule triggered");
            scriptBroadcast("mule");
            scriptBroadcast("quit");
            return true;
        }

        //首先要看自己有几个回收
        var i, recyclePotion, npc, recycleCount = this.recycleItems.length + this.recycleItemSets.length;
        print(recycleCount);
        if (recycleCount === 0) {
            return true;
        }
        //去shop买药
        Town.initNPC("Key", "buyRecyclePotions"); //此时已打开界面
        npc = getInteractedNPC();
        recyclePotion = this.getRecyclePotion(npc);
        //print(recyclePotion.classid);
        for (i = 0; i < recycleCount; i++) {
            if (Storage.Inventory.CanFit({ sizex: 1, sizey: 1 })) {
                recyclePotion.buy(false);
            }
        }

        return true;
    },

    getMyRecyclePotion: function () {
        var item, recyclePotion;
        item = me.getItem();

        do {
            if (this.checkRecycle(item) === -2) {
                recyclePotion = item;
                break;
            }
        } while (item.getNext())
        return recyclePotion;
    },

    doRecycle: function () {
        this.buildRecycleList();
        this.buyRecyclePotions();

        var i, j, items, recyclePotion, result;

        for (i = 0; i < this.recycleItems.length; i++) {

            if ((!getUIFlag(0x1a) && !Town.openStash()) || !Cubing.emptyCube()) {
                return false;
            }

            Cubing.cursorCheck();

            recyclePotion = this.getMyRecyclePotion();
            if (!recyclePotion) {
                this.buyRecyclePotions();
            }

            Storage.Cube.MoveTo(recyclePotion);// 放入回收药剂
            Storage.Cube.MoveTo(this.recycleItems[i]);// 放入回收装备
            result = Pickit.checkItem(this.recycleItems[i]);
            Misc.itemLogger("Recycled", this.recycleItems[i]);
            Misc.logItem("Recycled", this.recycleItems[i], result.line);

            if (!Cubing.openCube()) {
                return false;
            }

            transmute();

            this.recycleItems.splice(i, 1);
            i -= 1;

            items = me.findItems(-1, -1, 6);

            if (items) {
                for (j = 0; j < items.length; j += 1) {

                    result = Pickit.checkItem(items[j]);

                    switch (result.result) {
                        case 0:
                            Misc.itemLogger("Dropped", items[j], "doCubing");
                            items[j].drop();

                            break;
                        case 1:
                            Misc.itemLogger("Recycled got", items[j]);
                            Misc.logItem("Recycled got", items[j], result.line);

                            break;
                        case 5: // Crafting System
                            CraftingSystem.update(items[j]);

                            break;
                    }
                }
            }

            if (!Cubing.emptyCube()) {
                break;
            }
        }

        for (i = 0; i < this.recycleItemSets.length; i++) {

            if ((!getUIFlag(0x1a) && !Town.openStash()) || !Cubing.emptyCube()) {
                return false;
            }

            Cubing.cursorCheck();

            recyclePotion = this.getMyRecyclePotion();
            if (!recyclePotion) {
                this.buyRecyclePotions();
            }

            Storage.Cube.MoveTo(recyclePotion);// 放入回收药剂
            for (j = 0; j < this.recycleItemSets[i].length; j++) {
                Storage.Cube.MoveTo(this.recycleItemSets[i][j]); // 放入多件回收装备
                result = Pickit.checkItem(this.recycleItemSets[i][j]);
                Misc.itemLogger("Recycled", this.recycleItemSets[i][j]);
                Misc.logItem("Recycled", this.recycleItemSets[i][j], result.line);
            }


            if (!Cubing.openCube()) {
                return false;
            }

            transmute();

            this.recycleItemSets.splice(i, 1);
            i -= 1;

            items = me.findItems(-1, -1, 6);

            if (items) {

                for (j = 0; j < items.length; j += 1) {

                    result = Pickit.checkItem(items[j]);

                    switch (result.result) {
                        case 0:
                            Misc.itemLogger("Dropped", items[j], "doCubing");
                            items[j].drop();

                            break;
                        case 1:
                            Misc.itemLogger("Recycled got", items[j]);
                            Misc.logItem("Recycled got", items[j], result.line);

                            break;
                        case 5: // Crafting System
                            CraftingSystem.update(items[j]);

                            break;
                    }
                }
            }

            if (!Cubing.emptyCube()) {
                break;
            }
        }

        return true;

    },

};
