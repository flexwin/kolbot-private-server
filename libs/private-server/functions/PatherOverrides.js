/**
*	@文件名     PatherOverrides.js
*	@作者       Black phoen1x
*	@描述       重写Pather类，解决私服城内绕路踢桶问题
*   @kolbot版本 113d-core15
*/

/*
    重写Pather的useWaypoint函数（anhei3私服必须点开小站界面），用于解决私服城内绕路踢桶问题
*/
Pather.useWaypoint = function useWaypoint(targetArea, check) {
    switch (targetArea) {
        case undefined:
            throw new Error("useWaypoint: Invalid targetArea parameter: " + targetArea);
        case null:
        case "random":
            check = true;

            break;
        default:
            if (typeof targetArea !== "number") {
                throw new Error("useWaypoint: Invalid targetArea parameter");
            }

            if (this.wpAreas.indexOf(targetArea) < 0) {
                throw new Error("useWaypoint: Invalid area");
            }
            check = true; //需要点开界面检查

            break;
    }

    var i, tick, wp, townTargetAreas = [1, 40, 75, 103, 109];

    for (i = 0; i < 12; i += 1) {
        if (me.area === targetArea || me.dead) {
            break;
        }

        if (me.inTown) {
            Town.move("waypoint");
        }

        wp = getUnit(2, "waypoint");

        if (wp && wp.area === me.area) {
            if (!me.inTown && getDistance(me, wp) > 7) {
                this.moveToUnit(wp);
            }

            if (check || Config.WaypointMenu) {
                if (getDistance(me, wp) > 5) {
                    this.moveToUnit(wp);
                }

                Misc.click(0, 0, wp);

                tick = getTickCount();

                while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
                    if (getUIFlag(0x14)) { // Waypoint screen is open
                        delay(500);

                        switch (targetArea) {
                            case "random":
                                while (true) {
                                    targetArea = this.wpAreas[rand(0, this.wpAreas.length - 1)];

                                    // get a valid wp, avoid towns
                                    if ([1, 40, 75, 103, 109].indexOf(targetArea) === -1 && getWaypoint(this.wpAreas.indexOf(targetArea))) {
                                        break;
                                    }

                                    delay(5);
                                }

                                break;
                            case null:
                                me.cancel();

                                return true;
                        }

                        if (!getWaypoint(this.wpAreas.indexOf(targetArea))) {
                            me.cancel();
                            me.overhead("Trying to get the waypoint");

                            if (this.getWP(targetArea)) {
                                return true;
                            }

                            throw new Error("Pather.useWaypoint: Failed to go to waypoint");
                        }

                        break;
                    }

                    delay(10);
                }

                if (!getUIFlag(0x14)) {
                    print("waypoint retry " + (i + 1));
                    this.moveTo(me.x + rand(-5, 5), me.y + rand(-5, 5));
                    Packet.flash(me.gid);

                    continue;
                }
            }

            if (!check || getUIFlag(0x14)) {
                delay(200);
                wp.interact(targetArea);

                tick = getTickCount();

                while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
                    if (me.area === targetArea) {
                        delay(100);

                        return true;
                    }

                    delay(10);
                }

                me.cancel(); // In case lag causes the wp menu to stay open
            }

            Packet.flash(me.gid);

            if (i > 1) { // Activate check if we fail direct interact twice
                check = true;
            }
        } else {
            Packet.flash(me.gid);
        }

        delay(200 + me.ping);
    }

    if (me.area === targetArea) {
        return true;
    }

    throw new Error("useWaypoint: Failed to use waypoint");
};

/*
    重写Pather的moveToExit函数，用于解决A1出城门踢桶问题
*/
Pather.moveToExit = function (targetArea, use, clearPath) {
    var i, j, area, exits, targetRoom, dest, currExit,
        areas = [];

    if (targetArea instanceof Array) {
        areas = targetArea;
    } else {
        areas.push(targetArea);
    }

    for (i = 0; i < areas.length; i += 1) {
        area = getArea();

        if (!area) {
            throw new Error("moveToExit: error in getArea()");
        }

        exits = area.exits;

        if (!exits || !exits.length) {
            return false;
        }

        for (j = 0; j < exits.length; j += 1) {
            currExit = {
                x: exits[j].x,
                y: exits[j].y,
                type: exits[j].type,
                target: exits[j].target,
                tileid: exits[j].tileid
            };

            if (currExit.target === areas[i]) {
                dest = this.getNearestWalkable(currExit.x, currExit.y, 5, 1);

                if (!dest) {
                    return false;
                }

                if (me.inTown) {
                    Town.initialize();
                    Town.act[me.act - 1].spot.exit = [dest[0], dest[1]];
                    if (!Town.move("exit")) {
                        return false;
                    }
                } else {
                    if (!this.moveTo(dest[0], dest[1], 3, clearPath)) {
                        return false;
                    }
                }

                /* i < areas.length - 1 is for crossing multiple areas.
                    In that case we must use the exit before the last area.
                */
                if (use || i < areas.length - 1) {
                    switch (currExit.type) {
                        case 1: // walk through
                            targetRoom = this.getNearestRoom(areas[i]);

                            if (targetRoom) {
                                this.moveTo(targetRoom[0], targetRoom[1]);
                            } else {
                                // might need adjustments
                                return false;
                            }

                            break;
                        case 2: // stairs
                            if (!this.useUnit(5, currExit.tileid, areas[i])) {
                                return false;
                            }

                            break;
                    }
                }

                break;
            }
        }
    }

    if (use) {
        return typeof targetArea === "object" ? me.area === targetArea[targetArea.length - 1] : me.area === targetArea;
    }

    return true;
};

/*
    重写Pather的usePortal函数（私服禁用TK portal），用于解决私服城内绕路踢桶问题
*/
Pather.usePortal = function (targetArea, owner, unit) {
    if (targetArea && me.area === targetArea) {
        return true;
    }

    me.cancel();

    var i, tick, portal, useTK,
        preArea = me.area;

    for (i = 0; i < 10; i += 1) {
        if (me.dead) {
            break;
        }

        if (i > 0 && owner && me.inTown) {
            Town.move("portalspot");
        }

        portal = unit ? copyUnit(unit) : this.getPortal(targetArea, owner);

        if (portal) {
            if (i === 0) {
                //useTK = me.classid === 1 && me.getSkill(43, 1) && me.inTown && portal.getParent();
                useTK = false;
            }

            if (portal.area === me.area) {
                if (useTK) {
                    if (getDistance(me, portal) > 13) {
                        Attack.getIntoPosition(portal, 13, 0x4);
                    }

                    Skill.cast(43, 0, portal);
                } else {
                    if (getDistance(me, portal) > 5) {
                        this.moveToUnit(portal);
                    }

                    if (i < 2) {
                        sendPacket(1, 0x13, 4, 0x2, 4, portal.gid);
                    } else {
                        Misc.click(0, 0, portal);
                    }
                }
            }

            if (portal.classid === 298 && portal.mode !== 2) { // Portal to/from Arcane
                Misc.click(0, 0, portal);

                tick = getTickCount();

                while (getTickCount() - tick < 2000) {
                    if (portal.mode === 2 || me.area === 74) {
                        break;
                    }

                    delay(10);
                }
            }

            tick = getTickCount();

            while (getTickCount() - tick < Math.max(Math.round((i + 1) * 1000 / (i / 5 + 1)), me.ping * 2)) {
                if (me.area !== preArea) {
                    delay(100);

                    return true;
                }

                delay(10);
            }

            if (i > 1) {
                Packet.flash(me.gid);

                useTK = false;
            }
        } else {
            Packet.flash(me.gid);
        }

        delay(200 + me.ping);
    }

    return targetArea ? me.area === targetArea : me.area !== preArea;
};