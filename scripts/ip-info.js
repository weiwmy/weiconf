if ($response.statusCode !== 200) {
  $done(null);
}

const cityFallback = "未知城市";
const ispFallback = "未知ISP";

function validCity(city) {
  return city || cityFallback;
}

function validISP(isp) {
  return isp || ispFallback;
}

function firstWordISP(isp) {
  if (!isp) return ispFallback;
  return isp.trim().split(/\s+/)[0];
}

const flags = new Map([
  ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"], ["AL", "🇦🇱"],
  ["AQ", "🇦🇶"], ["AR", "🇦🇷"], ["AS", "🇦🇸"], ["AT", "🇦🇹"], ["AU", "🇦🇺"],
  ["AW", "🇦🇼"], ["AX", "🇦🇽"], ["AZ", "🇦🇿"], ["BA", "🇧🇦"], ["BB", "🇧🇧"],
  ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"], ["BH", "🇧🇭"],
  ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"], ["BN", "🇧🇳"], ["BO", "🇧🇴"],
  ["BR", "🇧🇷"], ["BS", "🇧🇸"], ["BT", "🇧🇹"], ["BW", "🇧🇼"], ["BY", "🇧🇾"],
  ["BZ", "🇧🇿"], ["CA", "🇨🇦"], ["CF", "🇨🇫"], ["CH", "🇨🇭"], ["CK", "🇨🇰"],
  ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"], ["CO", "🇨🇴"], ["CR", "🇨🇷"],
  ["CU", "🇨🇺"], ["CV", "🇨🇻"], ["CW", "🇨🇼"], ["CY", "🇨🇾"], ["CZ", "🇨🇿"],
  ["DE", "🇩🇪"], ["DJ", "🇩🇯"], ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"],
  ["DZ", "🇩🇿"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"], ["ES", "🇪🇸"],
  ["ET", "🇪🇹"], ["EU", "🇪🇺"], ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FR", "🇫🇷"],
  ["GA", "🇬🇦"], ["GB", "🇬🇧"], ["HK", "🇭🇰"], ["HU", "🇭🇺"], ["ID", "🇮🇩"],
  ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IN", "🇮🇳"], ["IS", "🇮🇸"], ["IT", "🇮🇹"],
  ["JP", "🇯🇵"], ["KR", "🇰🇷"], ["LU", "🇱🇺"], ["MO", "🇲🇴"], ["MX", "🇲🇽"],
  ["MY", "🇲🇾"], ["NL", "🇳🇱"], ["PH", "🇵🇭"], ["RO", "🇷🇴"], ["RS", "🇷🇸"],
  ["RU", "🇷🇺"], ["RW", "🇷🇼"], ["SA", "🇸🇦"], ["SC", "🇸🇨"], ["SE", "🇸🇪"],
  ["SG", "🇸🇬"], ["TH", "🇹🇭"], ["TR", "🇹🇷"], ["TW", "🇨🇳"], ["US", "🇺🇸"],
  ["VN", "🇻🇳"], ["ZA", "🇿🇦"], ["UA", "🇺🇦"], ["NZ", "🇳🇿"], ["PK", "🇵🇰"],
  ["NO", "🇳🇴"], ["PT", "🇵🇹"], ["PL", "🇵🇱"], ["GR", "🇬🇷"], ["NG", "🇳🇬"],
  ["KH", "🇰🇭"], ["LA", "🇱🇦"], ["MN", "🇲🇳"], ["JO", "🇯🇴"], ["IR", "🇮🇷"],
  ["OM", "🇴🇲"], ["PS", "🇵🇸"], ["NP", "🇳🇵"], ["LB", "🇱🇧"], ["IQ", "🇮🇶"],
  ["SY", "🇸🇾"], ["QA", "🇶🇦"], ["GE", "🇬🇪"], ["LK", "🇱🇰"], ["LT", "🇱🇹"],
  ["MT", "🇲🇹"], ["MC", "🇲🇨"], ["HR", "🇭🇷"], ["LV", "🇱🇻"], ["SK", "🇸🇰"],
  ["PA", "🇵🇦"], ["PE", "🇵🇪"], ["PY", "🇵🇾"], ["JM", "🇯🇲"], ["GT", "🇬🇹"],
  ["PR", "🇵🇷"], ["HN", "🇭🇳"], ["NI", "🇳🇮"], ["GH", "🇬🇭"], ["MA", "🇲🇦"],
  ["KE", "🇰🇪"], ["SI", "🇸🇮"], ["TG", "🇹🇬"]
]);

const obj = JSON.parse($response.body);

const title = `${flags.get(obj.countryCode) || ""} ${validCity(obj.city)}`;
const ip = obj.query;
const subtitle = `${firstWordISP(obj.isp)} · ${ip}`;
const description =
  `服务商: ${obj.isp}\n` +
  `地区: ${validCity(obj.regionName)}\n` +
  `IP: ${obj.query}\n` +
  `时区: ${obj.timezone}`;

$done({ title, subtitle, ip, description });
