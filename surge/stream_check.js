const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Accept-Language': 'en',
};

const STATUS_COMING = 2;
const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

(async () => {
  const panel_result = {
    title: 'Stream Check',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#FF2D55',
  };

  const [disneyStatus, youtubeStatus, netflixStatus] = await Promise.all([
    testDisneyPlus(),
    checkService('YouTube Premium', 'https://www.youtube.com/premium'),
    checkNetflix(),
  ]);

  const disney_result = getStatusResult('Disney+', disneyStatus);
  const content = [disney_result, youtubeStatus, netflixStatus].join('\n');
  panel_result.content = content;

  $done(panel_result);
})();

async function checkService(serviceName, url) {
  try {
    const data = await fetchData(url);
    if (data.includes('Premium is not available in your country')) {
      return `${serviceName}: Not Supported`;
    }
    const region = extractRegion(data);
    return `${serviceName}: Unlocked, Region: ${region.toUpperCase()}`;
  } catch (error) {
    return `${serviceName}: Detection Failed, Please Refresh the Panel`;
  }
}

async function fetchData(url) {
  const option = {
    url,
    headers: REQUEST_HEADERS,
  };

  return new Promise((resolve, reject) => {
    $httpClient.get(option, (error, response, data) => {
      if (error || response.status !== 200) {
        reject('Error');
      } else {
        resolve(data);
      }
    });
  });
}

function extractRegion(data) {
  const re = /"countryCode":"(.*?)"/g;
  const match = re.exec(data);
  if (match && match.length === 2) {
    return match[1];
  } else if (data.includes('www.google.cn')) {
    return 'CN';
  } else {
    return 'US';
  }
}

function getStatusResult(serviceName, status) {
  if (status === STATUS_NOT_AVAILABLE) {
    return `${serviceName}: Not Supported`;
  } else if (status === STATUS_TIMEOUT) {
    return `${serviceName}: Detection Timeout`;
  } else if (status === STATUS_ERROR) {
    return `${serviceName}: Detection Failed, Please Refresh the Panel`;
  }
  return status;
}

async function testDisneyPlus() {
  try {
    const { countryCode, inSupportedLocation } = await getLocationInfo();
    if (!inSupportedLocation || inSupportedLocation === 'false') {
      return { status: STATUS_COMING };
    } else {
      return { status: STATUS_AVAILABLE, region: countryCode };
    }
  } catch (error) {
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE };
    } else if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT };
    }
    return { status: STATUS_ERROR };
  }
}

function getLocationInfo() {
  const opts = {
    url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
    headers: {
      'Accept-Language': 'en',
      Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify({
      query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
      variables: {
        input: {
          applicationRuntime: 'chrome',
          attributes: {
            browserName: 'chrome',
            browserVersion: '117.0.0.0',
            manufacturer: 'apple',
            model: null,
            operatingSystem: 'macintosh',
            operatingSystemVersion: '10.15.7',
            osDeviceIds: [],
          },
          deviceFamily: 'browser',
          deviceLanguage: 'en',
          deviceProfile: 'macosx',
        },
      },
    }),
  };

  return new Promise((resolve, reject) => {
    $httpClient.post(opts, (error, response, data) => {
      if (error || response.status !== 200) {
        reject('Not Available');
      } else {
        const parsedData = JSON.parse(data);
        const {
          token: { accessToken },
          session: {
            inSupportedLocation,
            location: { countryCode },
          },
        } = parsedData?.extensions?.sdk;
        resolve({ inSupportedLocation, countryCode, accessToken });
      }
    });
  });
}
