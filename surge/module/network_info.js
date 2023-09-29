function getCellularInfo() {
    const radioGeneration = { 'GPRS': '2.5G', 'CDMA1x': '2.5G', 'EDGE': '2.75G', 'WCDMA': '3G', 'HSDPA': '3.5G', 'CDMAEVDORev0': '3.5G', 'CDMAEVDORevA': '3.5G', 'CDMAEVDORevB': '3.75G', 'HSUPA': '3.75G', 'eHRPD': '3.9G', 'LTE': '4G', 'NRNSA': '5G', 'NR': '5G' };
    let cellularInfo = '';
    const carrierNames = loadCarrierNames();
    if ($network['cellular-data']) {
      const carrierId = $network['cellular-data'].carrier;
      const radio = $network['cellular-data'].radio;
      if ($network.wifi?.ssid == null && radio) {
        cellularInfo = carrierNames[carrierId] ?
          `${carrierNames[carrierId]} | ${radioGeneration[radio]} - ${radio} ` :
          `Cellular Data | ${radioGeneration[radio]} - ${radio}`;
      }
    }
    return cellularInfo;
  }
  
  function getSSID() {
    return $network.wifi?.ssid;
  }
  
  function getIP() {
    const { v4, v6 } = $network;
    let info = [];
    if (!v4 && !v6) {
      info = ['Network may be disconnected', 'Please manually refresh to get the IP'];
    } else {
      v4?.primaryAddress && info.push(`Device IP: ${v4?.primaryAddress}`);
      v6?.primaryAddress && info.push(`IPv6 Address: Assigned`);
      v4?.primaryRouter && getSSID() && info.push(`Router IP: ${v4?.primaryRouter}`);
      v6?.primaryRouter && getSSID() && info.push(`IPv6 Router: Assigned`);
    }
    info = info.join("\n");
    return info + "\n";
  }
  
  function getNetworkInfo(retryTimes = 5, retryInterval = 1000) {
    httpMethod.get('http://ip-api.com/json').then(response => {
      if (Number(response.status) > 300) {
        throw new Error(`Request error with http status code: ${response.status}\n${response.data}`);
      }
      const info = JSON.parse(response.data);
      $done({
        title: getSSID() ?? getCellularInfo(),
        content:
          getIP() +
          `Node IP: ${info.query}\n` +
          `Node ISP: ${info.isp}\n` +
          `Node Location: ${getFlagEmoji(info.countryCode)} | ${info.country} - ${info.city}`,
        icon: getSSID() ? 'wifi' : 'simcard',
        'icon-color': getSSID() ? '#5A9AF9' : '#8AB8DD',
      });
    }).catch(error => {
      if (String(error).startsWith("Network changed")) {
        if (getSSID()) {
          $network.wifi = undefined;
          $network.v4 = undefined;
          $network.v6 = undefined;
        }
      }
      if (retryTimes > 0) {
        logger.error(error);
        logger.log(`Retry after ${retryInterval}ms`);
        setTimeout(() => getNetworkInfo(--retryTimes, retryInterval), retryInterval);
      } else {
        logger.error(error);
        $done({
          title: 'An error occurred',
          content: 'Unable to get current network information\nPlease check your network status and try again',
          icon: 'wifi.exclamationmark',
          'icon-color': '#CB1B45',
        });
      }
    });
  }
  
  (() => {
    const retryTimes = 5;
    const retryInterval = 1000;
    const surgeMaxTimeout = 29500;
    const scriptTimeout = retryTimes * 5000 + retryTimes * retryInterval;
    setTimeout(() => {
      logger.log("Script timeout");
      $done({
        title: "Request timed out",
        content: "Connection request timed out\nPlease check your network status and try again",
        icon: 'wifi.exclamationmark',
        'icon-color': '#CB1B45',
      });
    }, scriptTimeout > surgeMaxTimeout ? surgeMaxTimeout : scriptTimeout);
  
    logger.log("Script start");
    getNetworkInfo(retryTimes, retryInterval);
  })();
  