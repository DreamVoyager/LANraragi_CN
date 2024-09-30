/**
 * Functions for Generic API calls.
 */
const Server = {};

Server.isScriptRunning = false;

/**
 * Call that shows a popup to the user on success/failure.
 * Returns the promise so you can add final callbacks if needed.
 * @param {*} endpoint URL endpoint
 * @param {*} method GET/PUT/DELETE/POST
 * @param {*} successMessage Message written in the toast if request succeeded (success = 1)
 * @param {*} errorMessage Header of the error message if request fails (success = 0)
 * @param {*} successCallback called if request succeeded
 * @returns The result of the callback, or NULL.
 */
Server.callAPI = function (endpoint, method, successMessage, errorMessage, successCallback) {
    endpoint = new LRR.apiURL(endpoint);
    return fetch(endpoint, { method })
        .then((response) => (response.ok ? response.json() : { success: 0, error: "响应不正常" }))
        .then((data) => {
            if (Object.prototype.hasOwnProperty.call(data, "success") && !data.success) {
                throw new Error(data.error);
            } else {
                let message = successMessage;
                if ("successMessage" in data && data.successMessage) {
                    message = data.successMessage;
                }
                if (message !== null) {
                    LRR.toast({
                        heading: message,
                        icon: "success",
                        hideAfter: 7000,
                    });
                }

                if (successCallback !== null) return successCallback(data);

                return null;
            }
        })
        .catch((error) => LRR.showErrorToast(errorMessage, error));
};

Server.callAPIBody = function (endpoint, method, body, successMessage, errorMessage, successCallback) {
    endpoint = new LRR.apiURL(endpoint);
    return fetch(endpoint, { method, body })
        .then((response) => (response.ok ? response.json() : { success: 0, error: "响应不正常" }))
        .then((data) => {
            if (Object.prototype.hasOwnProperty.call(data, "success") && !data.success) {
                throw new Error(data.error);
            } else {
                let message = successMessage;
                if ("successMessage" in data && data.successMessage) {
                    message = data.successMessage;
                }
                if (message !== null) {
                    LRR.toast({
                        heading: message,
                        icon: "success",
                        hideAfter: 7000,
                    });
                }

                if (successCallback !== null) return successCallback(data);

                return null;
            }
        })
        .catch((error) => LRR.showErrorToast(errorMessage, error));
};

/**
 * Check the status of a Minion job until it's completed.
 * @param {*} jobId Job ID to check
 * @param {*} useDetail Whether to get full details or the job or not.
 *            This requires the user to be logged in.
 * @param {*} callback Execute a callback on successful job completion.
 * @param {*} failureCallback Execute a callback on unsuccessful job completion.
 * @param {*} progressCallback Execute a callback if the job reports progress. (aka, if there's anything in notes)
 */
Server.checkJobStatus = function (jobId, useDetail, callback, failureCallback, progressCallback = null) {
    let endpoint = new LRR.apiURL(useDetail ? `/api/minion/${jobId}/detail` : `/api/minion/${jobId}`);
    fetch(endpoint, { method: "GET" })
        .then((response) => (response.ok ? response.json() : { success: 0, error: "响应不正常" }))
        .then((data) => {
            if (data.error) throw new Error(data.error);

            if (data.state === "failed") {
                throw new Error(data.result);
            }

            if (data.state === "inactive") {
                // Job isn't even running yet, wait longer
                setTimeout(() => {
                    Server.checkJobStatus(jobId, useDetail, callback, failureCallback, progressCallback);
                }, 5000);
                return;
            }

            if (data.state === "active") {

                if (progressCallback !== null) {
                    progressCallback(data.notes);
                }

                // Job is in progress, check again in a bit
                setTimeout(() => {
                    Server.checkJobStatus(jobId, useDetail, callback, failureCallback, progressCallback);
                }, 1000);
            } 
            
            if (data.state === "finished") { 
                // Update UI with info
                callback(data);
            }
        })
        .catch((error) => { LRR.showErrorToast("检查Minion任务状态时出错", error); failureCallback(error); });
};

/**
 * POSTs the data of the specified form to the page.
 * This is used for Edit, Config and Plugins.
 * @param {*} formSelector The form to POST
 * @returns the promise object so you can chain more callbacks.
 */
Server.saveFormData = function (formSelector) {
    const postData = new FormData($(formSelector)[0]);

    return fetch(window.location.href, { method: "POST", body: postData })
        .then((response) => (response.ok ? response.json() : { success: 0, error: "响应不正常" }))
        .then((data) => {
            if (data.success) {
                LRR.toast({
                    heading: "保存成功!",
                    icon: "success",
                });
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => LRR.showErrorToast("保存时出错", error));
};

Server.triggerScript = function (namespace) {
    const scriptArg = $(`#${namespace}_ARG`).val();

    if (Server.isScriptRunning) {
        LRR.showErrorToast("一个脚本已在运行.", "请等待它完成.");
        return;
    }

    Server.isScriptRunning = true;
    $(".script-running").show();
    $(".stdbtn").hide();

    // Save data before triggering script
    Server.saveFormData("#editPluginForm")
        .then(Server.callAPI(`/api/plugins/queue?plugin=${namespace}&arg=${scriptArg}`, "POST", null, "执行脚本时出错 :",
            (data) => {
                // Check minion job state periodically while we're on this page
                Server.checkJobStatus(
                    data.job,
                    true,
                    (d) => {
                        Server.isScriptRunning = false;
                        $(".script-running").hide();
                        $(".stdbtn").show();

                        if (d.result.success === 1) {
                            LRR.toast({
                                heading: "脚本返回结果",
                                text: `<pre>${JSON.stringify(d.result.data, null, 4)}</pre>`,
                                icon: "info",
                                hideAfter: 10000,
                                closeOnClick: false,
                                draggable: false,
                            });
                        } else LRR.showErrorToast(`脚本出错: ${d.result.error}`);
                    },
                    () => {
                        Server.isScriptRunning = false;
                        $(".script-running").hide();
                        $(".stdbtn").show();
                    },
                );
            },
        ));
};

Server.cleanTemporaryFolder = function () {
    Server.callAPI("/api/tempfolder", "DELETE", "已清理临时文件夹!", "清理临时文件夹时出错 :",
        (data) => {
            $("#tempsize").html(data.newsize);
        },
    );
};

Server.invalidateCache = function () {
    Server.callAPI("/api/search/cache", "DELETE", "已清理搜索缓存!", "清理搜索缓存是出错! 检查日志.", null);
};

Server.clearAllNewFlags = function () {
    Server.callAPI("/api/database/isnew", "DELETE", "所有存档都不再是新的!", "清除标记时出错! 检查日志.", null);
};

Server.dropDatabase = function () {
    LRR.showPopUp({
        title: "这是一个（非常）具有破坏性的操作! ",
        text: "是否确实要清空数据库?",
        icon: "warning",
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: "是的, 我确定!",
        cancelButtonText: "取消",
        reverseButtons: true,
        confirmButtonColor: "#d33",
    }).then((result) => {
        if (result.isConfirmed) {
            Server.callAPI("/api/database/drop", "POST", "再见! 正在重定向...", "重置数据库时出错? 检查日志.",
                () => {
                    setTimeout(() => { document.location.href = "./"; }, 1500);
                },
            );
        }
    });
};

Server.cleanDatabase = function () {
    Server.callAPI("/api/database/clean", "POST", null, "清理数据库时出错! 检查日志.",
        (data) => {
            LRR.toast({
                heading: `成功清理数据库并删除 ${data.deleted} 条目!`,
                icon: "success",
                hideAfter: 7000,
            });

            if (data.unlinked > 0) {
                LRR.toast({
                    heading: `${data.unlinked} 其他条目已从数据库中取消链接，并将在下次清理时删除!`,
                    text: "如果某些文件从存档索引中消失，请立即执行备份.",
                    icon: "warning",
                    hideAfter: 16000,
                });
            }
        },
    );
};

Server.regenerateThumbnails = function (force) {
    const forceparam = force ? 1 : 0;
    Server.callAPI(`/api/regen_thumbs?force=${forceparam}`, "POST",
        "重新生成缩略图的任务正在排队！请继续关注更新或查看 Minion 控制台.",
        "将命令发送到 Minion 时出错:",
        (data) => {
            // Disable the buttons to avoid accidental double-clicks.
            $("#genthumb-button").prop("disabled", true);
            $("#forcethumb-button").prop("disabled", true);

            // Check minion job state periodically while we're on this page
            Server.checkJobStatus(
                data.job,
                true,
                (d) => {
                    $("#genthumb-button").prop("disabled", false);
                    $("#forcethumb-button").prop("disabled", false);
                    LRR.toast({
                        heading: "生成所有缩略图！遇到以下错误:",
                        text: d.result.errors,
                        icon: "success",
                        hideAfter: 15000,
                        closeOnClick: false,
                        draggable: false,
                    });
                },
                (error) => {
                    $("#genthumb-button").prop("disabled", false);
                    $("#forcethumb-button").prop("disabled", false);
                    LRR.showErrorToast("缩略图重新生成失败!", error);
                },
            );
        },
    );
};

// Adds an archive to a category. Basic implementation to use everywhere.
Server.addArchiveToCategory = function (arcId, catId) {
    Server.callAPI(`/api/categories/${catId}/${arcId}`, "PUT", `添加 ${arcId} 到分类 ${catId}!`, "添加/删除档案到分类时出错", null);
};

// Ditto, but for removing.
Server.removeArchiveFromCategory = function (arcId, catId) {
    Server.callAPI(`/api/categories/${catId}/${arcId}`, "DELETE", `删除 ${arcId} 从分类 ${catId}!`, "添加/删除档案到分类时出错", null);
};

/**
 * Sends a DELETE request for that archive ID,
 * deleting the Redis key and attempting to delete the archive file.
 * @param {*} arcId Archive ID
 * @param {*} callback Callback to execute once the archive is deleted (usually a redirection)
 */
Server.deleteArchive = function (arcId, callback) {
    let endpoint = new LRR.apiURL(`/api/archives/${arcId}`);
    fetch(endpoint, { method: "DELETE" })
        .then((response) => (response.ok ? response.json() : { success: 0, error: "响应不正常" }))
        .then((data) => {
            if (!data.success) {
                LRR.toast({
                    heading: "无法删除档案文件. <br> (也许它已经被删除了?)",
                    text: "存档元数据已正确删除. <br> 请在返回档案库之前手动删除文件.",
                    icon: "warning",
                    hideAfter: 20000,
                });
                $(".stdbtn").hide();
                $("#goback").show();
            } else {
                LRR.toast({
                    heading: "已成功删除存档. 正在重定向 ...",
                    text: `文件名称 : ${data.filename}`,
                    icon: "success",
                    hideAfter: 7000,
                });
                setTimeout(callback, 1500);
            }
        })
        .catch((error) => LRR.showErrorToast("删除档案时出错", error));
};
