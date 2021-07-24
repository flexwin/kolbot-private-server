/**
*	@文件名     Global.js
*	@作者       Black phoen1x
*	@描述       用于加载Functions以及进行全体设置
*   @kolbot版本 113d-core15
*/

var SetUp = {
    /*
        函数导入所有Functions(重写类)脚本
    */
    include: function () {
        var i, j, files, folders = ["functions"];

        for (i = 0; i < folders.length; i++) {
            files = dopen("libs/private-server/" + folders[i] + "/").getFiles();
            for (j = 0; j < files.length; j++) {
                if (files[j].slice(files[j].length - 3) === ".js") {
                    if (!isIncluded("private-server/" + folders[i] + "/" + files[j])) {
                        if (!include("private-server/" + folders[i] + "/" + files[j])) {
                            throw new Error("Failed to include " + "private-server/" + folders[i] + "/" + files[j]);
                        }
                    }
                }
            }
        }
    }
}