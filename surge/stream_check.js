const axios = require('axios');

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
  'Accept-Language': 'en',
};

const STATUS = {
  COMING: 'Coming Soon',
  AVAILABLE: 'Available',
  NOT_AVAILABLE: 'Not Available for Unlocking',
  TIMEOUT: 'Timeout',
  ERROR: 'Error',
};

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

const services = [
  {
    name: 'Disney+',
    url: 'https://www.disneyplus.com/',
    test: testDisneyPlus,
  },
  {
    name: 'YouTube Premium',
    url: 'https://www.youtube.com/premium',
    test: testService,
  },
  {
    name: 'Netflix',
    url: 'https://www.netflix.com/title/80062035',
    test: testService,
  },
];

(async () => {
  let panelResult = {
    title: 'Streaming Unlock Detection',
    content: '',
    icon: 'play.tv.fill',
    'icon-color': '#FF2D55',
  };

  const results = await Promise.all(services.map(service => service.test(service.url)));

  const content = results.join('\n');
  panelResult['content'] = content;
  $done(panelResult);
})();

async function testService(url) {
  try {
    const response = await axios.get(url, { headers: REQUEST_HEADERS });

    if (response.status === 200) {
      return STATUS.AVAILABLE;
    } else {
      return STATUS.NOT_AVAILABLE;
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return STATUS.NOT_AVAILABLE;
    } else if (error.response && error.response.status === 404) {
      return STATUS.NOT_AVAILABLE;
    } else if (error.code === 'ECONNABORTED') {
      return STATUS.TIMEOUT;
    } else {
      return STATUS.ERROR;
    }
  }
}

async function testDisneyPlus(url) {
  try {
    const response = await axios.get(url, { headers: REQUEST_HEADERS, timeout: 7000 });

    if (response.status === 200) {
      const data = response.data;
      if (data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        return STATUS.COMING;
      }

      const match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      if (match) {
        const region = match[1];
        return `${STATUS.AVAILABLE}, Region: ${region.toUpperCase()}`;
      }
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return STATUS.TIMEOUT;
    } else {
      return STATUS.ERROR;
    }
  }

  return STATUS.NOT_AVAILABLE;
}
