define([ "jquery", "lib/core/ad_unit" ], function($, AdUnit) {

  "use strict";

  var defaultConfig = {
    adunits: ".adunit",
    listener: "#js-row--content",

    // Ad targeting properties
    layers: [ "2009.lonelyplanet" ],
    theme: "",
    template: "",
    topic: "",

    // Deprecated targeting properties
    adThm: "",
    adTnm: "",
    continent: "",
    country: "",
    destination: ""
  };

  function AdManager(config) {
    this.config = $.extend({}, defaultConfig, config);
    this.$listener = $(this.config.listener);
    this.loadedAds = [];
    this._init();
  }

  AdManager.prototype._init = function() {
    var self = this;

    this.pluginConfig = {
      dfpID: this.getNetworkID(),
      setTargeting: this.formatKeywords(),
      namespace: this.config.layers.join("/"),
      collapseEmptyDivs: true,
      enableSingleRequest: false,
      afterEachAdLoaded: function($adunit) {
        self._adCallback.call(self, $adunit);
      }
    };

    require([ "dfp" ], function() {

      self.load();

      self.$listener.on(":ads/refresh", function(e, type) {
        self.refresh(type);
      });

      self.$listener.on(":ads/reload", function(e) {
        self.load();
      });

    });
  };

  AdManager.prototype._adCallback = function($adunit) {
    if (!$adunit.data("googleAdUnit")) {
      this.loadedAds.push(new AdUnit($adunit));
    }
    // TODO: analytics here
  };

  AdManager.prototype.formatKeywords = function() {
    var keywords = {
      theme: this.config.theme || this.config.adThm,
      template: this.config.template,
      topic: this.config.topic,

      // Deprecated targeting properties
      thm: this.config.theme || this.config.adThm,
      tnm: (this.config.template || this.config.adTnm).replace(/\s/, "").split(","),
      ctt: this.config.continent,
      cnty: this.config.country,
      dest: this.config.destination
    };

    if (this.config.keyValues && !$.isEmptyObject(this.config.keyValues)) {
      for (var key in this.config.keyValues) {
        if (this.config.keyValues.hasOwnProperty(key)) {
          keywords[key] = this.config.keyValues[key];
        }
      }
    }

    return keywords;
  };

  AdManager.prototype.getNetworkID = function() {
    var networkID = 9885583,
        cookie = this._networkCookie(),
        param = this._networkParam();

    if (param) {
      networkID = param;
    } else if (cookie) {
      networkID = cookie;
    }

    return networkID;
  };

  AdManager.prototype._networkCookie = function() {
    return window.lp.getCookie("lpNetworkCode");
  };

  AdManager.prototype._networkParam = function() {
    var props = window.location.search.match(/lpNetworkCode=([0-9]{4,8})/);
    return props ? props.pop() : null;
  };

  AdManager.prototype.load = function() {
    var self = this;

    this.$adunits = $(this.config.adunits);

    // Filter out ad units that have already been loaded then
    // ad dimensions that may be too large for their context
    this.$adunits
      .filter(function(index) {
        return self.$adunits.eq(index).data("googleAdUnit") === undefined;
      })
      .filter(function(index) {
        return self._filterAdUnitDimensions(self.$adunits.eq(index)).length;
      })
      .dfp(this.pluginConfig);
  };

  AdManager.prototype.refresh = function(type) {
    if (type) {
      for (var i = 0, len = this.loadedAds.length; i < len; i++) {
        if (this.loadedAds[i].getType() === type) {
          this.loadedAds[i].refresh();
        }
      }
    } else {
      window.googletag.pubads().refresh();
    }
  };

  AdManager.prototype._filterAdUnitDimensions = function($adunit) {
    var filteredGroups = [],
        context = $adunit.data("context"),
        contextWidth = $(context || "body").width(),
        sizeGroups = $adunit.data("dimensions").split(",");

    for (var i = 0, len = sizeGroups.length; i < len; i++) {
      var sizeSet = sizeGroups[i].split("x");

      if (parseInt(sizeSet[0], 10) <= contextWidth) {
        filteredGroups.push(sizeGroups[i]);
      }
    }

    $adunit.data("dimensions", filteredGroups.join(","));

    return filteredGroups;
  };

  return AdManager;

});
