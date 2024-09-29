/**
 * Backup Operations.
 */
const Backup = {};

Backup.initializeAll = function () {
    // bind events to DOM
    $(document).on("click.return", "#return", () => { window.location.href = new LRR.apiURL("/"); });
    $(document).on("click.do-backup", "#do-backup", () => { window.open("./backup?dobackup=1", "_blank"); });

    // Handler for file uploading.
    $("#fileupload").fileupload({
        dataType: "json",
        done(e, data) {
            $("#processing").attr("style", "display:none");

            if (data.result.success === 1) $("#result").html("备份已恢复!");
            else $("#result").html(data.result.error);
        },

        fail() {
            $("#processing").attr("style", "display:none");
            $("#result").html("哎呀! 服务器端发生错误.<br/> 也许您的 JSON 格式不正确 ?");
        },

        progressall() {
            $("#result").html("");
            $("#processing").attr("style", "");
        },

    });
};

jQuery(() => {
    Backup.initializeAll();
});
