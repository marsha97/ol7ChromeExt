var status;
var method; //loginMethod
var windowID = 0;
var selection ="";
var messageRec; //pesan yang diterima

chrome.browserAction.onClicked.addListener(initAction);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	//TODO tambahi metode login baru selain BL
	messageRec = message;
	console.log("message status: " + messageRec.status);
    if ((message.username === "" || message.password === "" || message.phoneId === "" || message.phoneId === 0) 
            && (status === "loggedOut" || status === "")) {
        alert("Data harus diisi semua");
    } else {
        if (typeof (Storage) !== 'undefined') {
        	if (message.status === "loggedIn")
                if (localStorage.getItem("token") === "" || localStorage.getItem("token") === null || localStorage.getItem("user_id")===""||
                    localStorage.getItem("user_id") === null){
        		  getTokenNuserId(message.username, message.password);
                }
                else{
                    storeStatusData(messageRec.status);
                    changeWindow();
                }
        	else{
                console.log("if loggedOut true");
        		chrome.windows.getCurrent(function (window) {
        			storeStatusData(message.status);
        			console.log("window id out: " + window.id);
		    		windowID = window.id;
		    		closeWindow();
		    		createWindow();
                    showHideMenu();
				});
        	}
        } else {
            alert("Maaf, browser anda tidak dapat menyimpan data local. Mohon update browser Anda");
        }
    }
});

function getTokenNuserId(username, password){
	var settings = {
		"url": "https://api.bukalapak.com/v2/authenticate.json",
  		"method": "POST",
  		"headers": {
  		  "content-type": "application/x-www-form-urlencoded",
   		  "authorization": "Basic " + btoa(messageRec.username + ":" + messageRec.password)
 		 }
	};
	$.ajax(settings).done(function(response){
		doLoggedInActions(response);
	});
}

function doLoggedInActions(response){
	console.log("message: " + response["message"]);
    console.log("status doLoggedIn: " + status);
	if (response["message"] === null || response["message"] === ""){
		storeData(response["user_id"],response["token"], messageRec.phoneId, messageRec.status);
        changeWindow();
	}
	else{
		showInvalidUserMsg(response["message"]);
	}
}

function changeWindow(){
    chrome.windows.getCurrent(function (window) {
            windowID = window.id;
            closeWindow();
            createWindow();
            showHideMenu();
        });
}
function showInvalidUserMsg(message){
	alert(message);
}

function showHideMenu(){
    console.log("showHideMenu msg: " + status);
	if (status === "loggedOut"){
		removeContextMenu();
	}
	else if (status === "loggedIn"){
		createContextMenu();
	}
}

function createContextMenu(){
	chrome.contextMenus.create({"title":"Cari '%s' di aplikasi OLSeven", "contexts":["selection"], "onclick":getSelection});
	//chrome.contextMenus.create({title:"Cari '%s' di aplikasi OLSeven", contexts:["selection"], onclick:getSelection},searchatBL);
}

function removeContextMenu(){
	chrome.contextMenus.removeAll();
}

function getSelection(info){
	selection = info.selectionText;
	searchatBL();
}

function searchatBL(){
	if (status === "loggedIn" && selection !== ""){
        var settings = {
        "url": "https://api.bukalapak.com/v2/products.json?keywords=" + selection,
        "method": "GET",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "authorization": "Basic " + btoa(localStorage.getItem("user_id") + ":" + localStorage.getItem("token"));
         }
    };
    $.ajax(settings).done(function(response){
        console.log("response : "+ JSON.stringify(response));
    });
    }
}

function checkStatus() {
    if (localStorage.getItem("status") !== null) {
        status = localStorage.getItem("status");
    } else {
        status = "loggedOut";
    }
    console.log("check status: " + status);
}

function createWindow() {
    checkStatus();
    if (status === "loggedOut") {
        chrome.windows.create({url: "login.html", type: "popup", width: 800,
            height: 600});
    } else {
        chrome.windows.create({url: "main.html", type: "popup", width: 800,
            height: 600});
    }
}

function storeData(userID, token, phoneId, status) {
    localStorage.setItem("user_id", userID);
    localStorage.setItem("token", token);
    localStorage.setItem("phoneId", phoneId);
    localStorage.setItem("status", status);
}

function closeWindow() {
    chrome.windows.remove(windowID, function () {
        windowID = 0;
    });
}

function initAction(){
    status = localStorage.getItem("status");
    createWindow();
}

function storeStatusData(statusData){
    localStorage.setItem("status", statusData);
}