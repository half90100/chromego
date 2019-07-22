chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    var message_pay_load      = JSON.parse(request.message_payload);
    //var now = new Date();
    //now = (parseFloat)(now.getTime()) / 1000;
    //trace((String)(now) + request.message_type)
    
    if (typeof sender.tab == "undefined")
      sender.tab = {id: null, url: null, windowId: null};
    message_pay_load["tabId"] = sender.tab.id;
    message_pay_load["tabUrl"] = sender.tab.url;
    message_pay_load["winId"] = sender.tab.windowId;

    switch(request.message_type) {
      case "BACK_EULA_ACCEPTED":
        ALX_BK_SPARKLINE.openInstallTab()
        sendResponse({});
        break;
      case "BACK_DATA_REQUEST":
        message_pay_load["tab"] = sender.tab;
        ALX_BK_SPARKLINE.update( message_pay_load );
        sendResponse({}); // snub them.
        break;
      default:
        sendResponse({}); // snub them.
    }
  }
);

$(window).on("message", function(e) {
  if (e.type == "message" && e.originalEvent) {
    var data = e.originalEvent.data
    if (data.mType == "rpcSendAndReceive") {
      var method = data.payload["api"]
      var args   = data.payload["args"]
      
      ALX_BK_SPARKLINE[method](args, data, function(ret) {
        var rdata = {
            result: ret
          , rMsgId: data.msgId
        } 
        var msg = ALX_BK_Helper.buildMessage("callBackendAPIResponse", null, rdata, null);
        msg.destination = data.origin
        ALX_BK_SPARKLINE.sendAppsMessage(msg)
      })
    } 
  }
})
