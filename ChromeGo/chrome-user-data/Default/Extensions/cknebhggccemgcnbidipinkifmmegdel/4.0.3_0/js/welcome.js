function acceptTerms() {
  ALX_BK_Helper.acceptTerm();
  var _alx_data = {};
  var _alx_data_payload = ALX_BK_Helper.createRequestData( "BACK_EULA_ACCEPTED", _alx_data);
  chrome.extension.sendRequest( _alx_data_payload, function() {
    window.close()
  });
};

function declineTerms() {
  ALX_BK_Helper.declineTerm();
  window.close();
};

function onload() {
  $("#accept").click(acceptTerms)
  $("#decline").click(declineTerms)
}

$(window).load(onload);
