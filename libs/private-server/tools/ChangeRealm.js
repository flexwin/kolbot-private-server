/**
*	@filename	ChangeRealm.js
*	@author		Black phoen1x
*	@desc		Thread for changing realm
*/

function main() {
    include("json2.js");
    include("OOG.js");
    include("common/misc.js");

    D2Bot.init(); //初始化D2Bot#

    var targetRealm; //目标国度

    this.scriptEvent = function (msg) {
        if (msg.indexOf("realm") > -1) {
            targetRealm = parseInt(msg.substring(5, 6)); //将目标国度改为消息中的国度
            scriptBroadcast("receivedRealm");
            //print("receivedRealm");
        }
    };

    /*
        函数 恢复主线程
    */
    this.dbjResume = function () {
        var i, script,
            scripts = ["D2BotLeadPrivateServer.dbj", "D2BotFollowPrivateServer.dbj", "D2BotMulePrivateServer.dbj"];

        for (i = 0; i < scripts.length; i += 1) {
            script = getScript(scripts[i]);

            if (script) {
                if (!script.running) {
                    // if (i === 0) {
                    //     print("Resuming.");
                    // }
                    script.resume();
                    scriptBroadcast("realmChanged");
                }
            }
        }

        return true;
    };

    /*
        函数 退出到选择人物界面改变国度
    */
    this.changeRealm = function (targetRealm) {
        var control;
        me.blockMouse = true;
        D2Bot.updateStatus("Changing Realm"); //在D2Bot#显示状态Changing Realm
        do {
            ControlAction.click(6, 693, 490, 80, 20); //点击quit
            delay(500);
        } while (!getLocation() === 12)//如果不在选择人物界面则重复以下循环

        do {
            control = getControl(6, 609, 113, 182, 30);
            delay(500);
        } while (!control)

        control.click(); //点击Change Realm按钮
        while (!getLocation() === 43) { //等待进入选择国度界面
            delay(500);
        }
        ControlAction.click(4, 461, 230, 320, 70, 621, 245 + 30 * (targetRealm - 1)); //点击国度标签
        ControlAction.click(6, 495, 438, 96, 32); //点击OK按钮
        me.blockMouse = false;

        return true;
    }

    /*
        函数 暂停主线程
    */
    this.sendPauseMsg = function () {
        var i, script,
            scripts = ["D2BotLeadPrivateServer.dbj", "D2BotFollowPrivateServer.dbj", "D2BotMulePrivateServer.dbj"];

        for (i = 0; i < scripts.length; i += 1) {
            script = getScript(scripts[i]);

            if (script) {
                if (script.running) {
                    // if (i === 0) {
                    //     print("Pausing.");
                    // }
                    Messaging.sendToScript(scripts[i], "pause");
                    while (script.running) {
                        delay(500);
                    }
                }
            }
        }

        return true;
    }

    addEventListener("scriptmsg", this.scriptEvent); //监听脚本消息事件

    while (true) {
        if (getLocation() === 1) { //当进入lobby后
            if (targetRealm) { //如果存在目标国度
                this.sendPauseMsg(); //暂停主线程
                this.changeRealm(targetRealm); //退出到选择人物界面改变国度
                this.dbjResume(); //恢复主线程
                return true; //结束线程 减少功耗
            }
        }
        delay(20);
    }
}