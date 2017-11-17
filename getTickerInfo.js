var _ = require("lodash");
var ccxt = require("ccxt");
var MongoClient = require("mongodb").MongoClient,
  assert = require("assert");

var url = "mongodb://localhost:27017/test";
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server");
  insertDocuments(db, function() {});
});

var insertDocuments = function(db, callback) {
  ccxt.exchanges.forEach(r => {
    let exchange = new ccxt[r]();
    let mkt = r;
    if (exchange.hasFetchTickers)
      var ticks = exchange
        .fetchTickers()
        .then(res => {
          if (_.isObject(res))
            Object.keys(res).forEach(ticker => {
              let tick = res[ticker];
              tick.market = mkt;
              let mkmodel = mkt.charAt(0).toUpperCase() + mkt.slice(1) + "tick";
              var collection = db.collection(mkmodel);
              collection.insert(tick, function(err, result) {
                callback(result);
              });
            });
        })
        .catch(e => {});
    console.log(`${mkt} added to the DB`);
  });
};