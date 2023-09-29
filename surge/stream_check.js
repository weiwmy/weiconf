const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
};

const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';

;(async () => {
  let panel_result = {
    title: 'Streaming Unlock Detection',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#FF2D55',
  };

  let [{ region, status }] = await Promise.all([testDisneyPlus()]);
  await Promise.all([checkYoutubePremium(), checkNetflix()])
    .then((result) => {
      console.log(result);
      let disney_result = '';
      if (status == STATUS_COMING) {
        disney_result = 'Disney+: Coming soon~ ' + region.toUpperCase();
      } else if (status == STATUS_AVAILABLE) {
        console.log(region);
        disney_result = 'Disney+: Unlocked, Region: ' + region.toUpperCase();
      } else if (status == STATUS_NOT_AVAILABLE) {
        disney_result = 'Disney+: Not supported 🚫 ';
      } else if (status == STATUS_TIMEOUT) {
        disney_result = 'Disney+: Detection timeout 🚦';
      }
      result.push(disney_result);
      console.log(result);
      let content = result.join('\n');
      console.log(content);
      panel_result['content'] = content;
    })
    .finally(() => {
      $done(panel_result);
    });
})();

async function checkYoutubePremium() {
  let inner_check = () => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function (error, response, data) {
        if (error != null || response.status !== 200) {
          reject('Error');
          return;
        }

        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve('Not Available');
          return;
        }

        let region = '';
        let re = new RegExp('"countryCode":"(.*?)"', 'gm');
        let result = re.exec(data);
        if (result != null && result.length === 2) {
          region = result[1];
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN';
        } else {
          region = 'US';
        }
        resolve(region);
      });
    });
  };

  let youtube_check_result = 'YouTube: ';

  await inner_check()
    .then((code) => {
      if (code === 'Not Available') {
        youtube_check_result += 'Not supported for unlock';
      } else {
        youtube_check_result += 'Unlocked, Region: ' + code.toUpperCase();
      }
    })
    .catch((error) => {
      youtube_check_result += 'Detection failed, please refresh the panel';
    });

  return youtube_check_result;
}

async function checkNetflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      };
      $httpClient.get(option, function (error, response, data) {
        if (error != null) {
          reject('Error');
          return;
        }

        if (response.status === 403) {
          reject('Not Available');
          return;
        }

        if (response.status === 404) {
          resolve('Not Found');
          return;
        }

        if (response.status === 200) {
          let url = response.headers['x-originating-url'];
          let region = url.split('/')[3];
          region = region.split('-')[0];
          if (region == 'title') {
            region = 'us';
          }
          resolve(region);
          return;
        }

        reject('Error');
      });
    });
  };

  let netflix_check_result = 'Netflix: ';

  await inner_check(80062035)
    .then((code) => {
      if (code === 'Not Found') {
        return inner_check(80018499);
      }
      netflix_check_result += 'Fully unlocked, Region: ' + code.toUpperCase();
      return Promise.reject('BreakSignal');
    })
    .then((code) => {
      if (code === 'Not Found') {
        return Promise.reject('Not Available');
      }

      netflix_check_result += 'Only unlocked for original content, Region: ' + code.toUpperCase();
      return Promise.reject('BreakSignal');
    })
    .catch((error) => {
      if (error === 'BreakSignal') {
        return;
      }
      if (error === 'Not Available') {
        netflix_check_result += 'This node does not support unlocking';
        return;
      }
      netflix_check_result += 'Detection failed, please refresh the panel';
    });

  return netflix_check_result;
}

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)]);
    console.log(`homepage: region=${region}, cnbl=${cnbl}`);
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`);
    region = countryCode ?? region;
    console.log('region:' + region);
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING };
    } else {
      return { region, status: STATUS_AVAILABLE };
    }
  } catch (error) {
    console.log('error:' + error);
    if (error === 'Not Available') {
      console.log('Not available');
      return { status: STATUS_NOT_AVAILABLE };
    }
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT };
    }
    return { status: STATUS_ERROR };
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHk',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } }
