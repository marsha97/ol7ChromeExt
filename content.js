var uname;
var passwd;
var phone;
$(document).ready(function () {
    $('[data-toggle = "tooltip"]').tooltip();
    $("#loginBtn").click(function () {
        init();
        sendMessagetoBg("loggedIn");
    });
    $('#logoutBtn').click(function () {
        reset();
        sendMessagetoBg("loggedOut");
    });
});

function reset() {
    uname = "";
    passwd = "";
    phone = 0;
}
function init() {
    uname = $("#username").val();
    passwd = $("#password").val();
    phone = $("#phoneid").val();
}

function sendMessagetoBg(status) {
    chrome.runtime.sendMessage({"username": uname, "password": passwd, "phoneId": phone, "status": status});
}