const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Accept-Language': 'en',
};

// Status constants
const STATUS = {
  COMING: 2,
  AVAILABLE: 1,
  NOT_AVAILABLE: 0,
  TIMEOUT: -1,
  ERROR: -2,
};

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
    checkMedia('https://www.youtube.com/premium', 'YouTube'),
    checkMedia('https://www.netflix.com/title/80062035', 'Netflix (Fully Unlocked)'),
    checkMedia('https://www.netflix.com/title/80018499', 'Netflix (Originals Only)'),
  ]);

  const disney_result = getStatusText('Disney+', disneyStatus);

  const content = [disney_result, youtubeStatus, netflixStatus].join('\n');

  panel_result.content = content;

  $done(panel_result);
})();

async function checkMedia(url, serviceName) {
  try {
    const { data, status } = await httpRequest(url);
    if (status !== 200) throw new Error('Not Available');
    if (serviceName === 'YouTube') {
      if (data.includes('Premium is not available in your country')) {
        return 'Not Supported';
      }
      const region = getRegionCode(data);
      return `Unlocked, Region: ${region}`;
    } else if (serviceName.startsWith('Netflix')) {
      const region = getNetflixRegion(data);
      return region ? `${serviceName}: ${region}` : 'This Node Does Not Support Unlocking';
    }
  } catch (error) {
    if (error.message === 'Not Available') {
      return 'Not Supported';
    }
    return 'Detection Failed, Please Refresh the Panel';
  }
}

async function testDisneyPlus() {
  try {
    const { region, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);

    if (!inSupportedLocation) {
      return { region, status: STATUS.COMING };
    } else {
      return { region, status: STATUS.AVAILABLE };
    }
  } catch (error) {
    if (error.message === 'Not Available') {
      return { status: STATUS.NOT_AVAILABLE };
    }
    if (error.message === 'Timeout') {
      return { status: STATUS.TIMEOUT };
    }
    return { status: STATUS.ERROR };
  }
}

function getLocationInfo() {
  const body = JSON.stringify({
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
  });

  return httpRequest('https://disney.api.edge.bamgrid.com/graph/v1/device/graphql', 'POST', body)
    .then(({ data }) => {
      const { inSupportedLocation, location: { countryCode } } = data?.extensions?.sdk;
      return { inSupportedLocation, countryCode };
    });
}

function getRegionCode(data) {
  const match = /"countryCode":"(.*?)"/.exec(data);
  return match ? match[1] : 'US';
}

function getNetflixRegion(data) {
  const match = /x-originating-url: https:\/\/www.netflix.com\/title\/(\d+)/i.exec(data);
  if (match) {
    const filmId = match[1];
    return filmId === '80062035' ? 'Fully Unlocked' : (filmId === '80018499' ? 'Originals Only' : null);
  }
  return null;
}

function getStatusText(serviceName, status) {
  switch (status) {
    case STATUS.COMING:
      return `${serviceName}: Coming Soon~`;
    case STATUS.AVAILABLE:
      return `${serviceName}: Unlocked, Region: ${status.region}`;
    case STATUS.NOT_AVAILABLE:
      return `${serviceName}: Not Supported`;
    case STATUS.TIMEOUT:
      return `${serviceName}: Detection Timeout`;
    case STATUS.ERROR:
      return `${serviceName}: Detection Failed`;
    default:
      return '';
  }
}

function httpRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      method,
      headers: REQUEST_HEADERS,
      body,
    };
    $httpClient.request(options, (error, response, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ data, status: response?.statusCode });
    });
  });
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'));
    }, delay);
  });
}
