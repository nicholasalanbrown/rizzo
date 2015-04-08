require(["http://c.amazon-adsystem.com/aax2/amzn_ads.js"], function (amzn) {

  "use strict";

  console.log('loaded amazon', amzn);

  try {
    var amazon_ads = amznads.getAds('3231');
    console.log('amazon_ads',amazon_ads);
  } catch(e) {
    console.log(e);
  }
});
