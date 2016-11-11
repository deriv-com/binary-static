var TradingAnalysis   = require('./analysis').TradingAnalysis;
var displayCurrencies = require('./currency').displayCurrencies;
var Defaults          = require('./defaults').Defaults;
var TradingEvents     = require('./event').TradingEvents;
var Message           = require('./message').Message;
var Price             = require('./price').Price;
var Guide = require('../../common_functions/guide').Guide;
var japanese_client = require('../../common_functions/country_base').japanese_client;

var TradePage = (function(){

  var trading_page = 0, events_initialized = 0;

  var onLoad = function(){
    if(japanese_client() && /\/trading\.html/i.test(window.location.pathname)) {
        window.location.href = page.url.url_for('multi_barriers_trading');
        return;
    } else if (!japanese_client() && /\/multi_barriers_trading\.html/.test(window.location.pathname)) {
        window.location.href = page.url.url_for('trading');
        return;
    }
    trading_page = 1;
    if(sessionStorage.getItem('currencies')){
      displayCurrencies();
    }
    BinarySocket.init({
      onmessage: function(msg){
        Message.process(msg);
      }
    });
    Price.clearFormId();
    if (events_initialized === 0) {
        events_initialized = 1;
        TradingEvents.init();
    }
    Content.populate();

    if(sessionStorage.getItem('currencies')){
      displayCurrencies();
      Symbols.getSymbols(1);
    }
    else {
      BinarySocket.send({ payout_currencies: 1 });
    }

    if (document.getElementById('websocket_form')) {
        addEventListenerForm();
    }

    // Walktrough Guide
    Guide.init({
      script : 'trading'
    });
    TradingAnalysis.bindAnalysisTabEvent();
    $('#tab_portfolio a').text(page.text.localize('Portfolio'));
    $('#tab_graph a').text(page.text.localize('Chart'));
    $('#tab_explanation a').text(page.text.localize('Explanation'));
    $('#tab_last_digit a').text(page.text.localize('Last Digit Stats'));
  };

  var reload = function() {
    sessionStorage.removeItem('underlying');
    window.location.reload();
  };

  var onUnload = function(){
    trading_page = 0;
    events_initialized = 0;
    forgetTradingStreams();
    BinarySocket.clear();
    Defaults.clear();
    chartFrameCleanup();
  };

  return {
    onLoad: onLoad,
    reload: reload,
    onUnload : onUnload,
    is_trading_page: function(){return trading_page;}
  };
})();

module.exports = {
    TradePage: TradePage,
};
