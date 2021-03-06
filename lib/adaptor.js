/*
 * cylon crazyflie adaptor
 * http://cylonjs.com
 *
 * Copyright (c) 2013-2014 The Hybrid Group
 * Licensed under the Apache 2.0 license.
*/

"use strict";

require('./cylon-crazyflie');
require('./commands');

var Aerogel = require('aerogel');
var namespace = require('node-namespace');

namespace("Cylon.Adaptors", function() {
  this.Crazyflie = (function(klass) {
    subclass(Crazyflie, klass);

    function Crazyflie(opts) {
      if (opts == null) { opts = {}; }

      Crazyflie.__super__.constructor.apply(this, arguments);

      this.aerogelDriver = new Aerogel.CrazyDriver();
      this.aerogelDriver.radio = new Aerogel.CrazyRadio();
      this.copter = new Aerogel.Copter(this.aerogelDriver);
      this.connector = this.copter;
      this.proxyMethods(Cylon.Crazyflie.Commands, this.copter, this);
    }

    Crazyflie.prototype.commands = function() {
      return Cylon.Crazyflie.Commands;
    };

    Crazyflie.prototype.connect = function(callback) {
      var port;
      Logger.info("Connecting to Crazyflie '" + this.name + "' on port '" + this.connection.port + "'...");
      port = this.connection.port;
      Logger.info(port);
      if (port === "none") {
        return this.connectFirstCopter(callback);
      } else {
        return this.doConnect(port, callback);
      }
    };

    Crazyflie.prototype.doConnect = function(port, callback) {
      return this.copter.connect(port).then(function() {
        callback(null);
        return this.connection.emit('connect');
      });
    };

    Crazyflie.prototype.disconnect = function() {
      Logger.info("Disconnecting from Crazyflie '" + this.name + "'...");
      return this.copter.shutdown();
    };

    Crazyflie.prototype.setParam = function(param, value) {
      return this.copter.driver.parameters.set(param, value);
    };

    Crazyflie.prototype.connectFirstCopter = function(callback) {
      return this.aerogelDriver.findCopters().then(function(copters) {
        if (copters.length === 0) {
          console.error('No copters found! Is your copter turned on?');
          return process.exit(1);
        } else {
          return this.doConnect(copters[0], callback);
        }
      });
    };

    Crazyflie.prototype.findCopters = function(callback) {
      return this.aerogelDriver.findCopters().then(function(copters) {
        return callback(copters);
      });
    };

    return Crazyflie;

  })(Cylon.Adaptor);
});
