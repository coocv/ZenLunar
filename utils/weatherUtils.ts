import { WeatherInfo, LocationData } from '../types';

export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// Reverse Geocoding: Try Nominatim first for detailed District/County info, fallback to BigDataCloud
export const getCityNameFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    // 1. Try Nominatim (OpenStreetMap) - Supports recursive details like District (区)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1&accept-language=zh-CN`;
    
    // Note: Nominatim requires a User-Agent. Browsers send one by default.
    const response = await fetch(nominatimUrl);
    
    if (response.ok) {
        const data = await response.json();
        const addr = data.address;
        
        if (addr) {
             // Order of preference: District (区) / County (县)
             const district = addr.district || addr.county || '';
             // City (市)
             const city = addr.city || addr.town || '';
             // State (省)
             const state = addr.state || '';

             // Combine City + District (e.g., 深圳市龙华区)
             if (city && district) {
                 // Avoid duplication if district string contains city (rare in zh-CN structure but good safety)
                 if (district.startsWith(city)) return district;
                 return `${city}${district}`;
             }
             
             if (city) return city;
             if (district && state) return `${state}${district}`;
             
             return addr.town || addr.village || addr.suburb || "未知地区";
        }
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode failed, falling back to BigDataCloud...", e);
  }

  // 2. Fallback: BigDataCloud
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    );
    if (!response.ok) return "未知地区";
    const data = await response.json();
    
    const city = data.city || '';
    const locality = data.locality || '';
    
    // BigDataCloud often puts District in 'locality'
    if (city && locality) {
         if (locality.startsWith(city)) return locality;
         return `${city}${locality}`;
    }
    return locality || city || data.principalSubdivision || "本地";
  } catch (e) {
    console.error("Reverse geocoding failed", e);
    return "本地";
  }
};

// Search Cities using Nominatim API for better Chinese support
export const searchCity = async (query: string): Promise<LocationData[]> => {
  if (!query || query.trim().length < 1) return [];

  // Use Nominatim for accurate Chinese results. Limit increased to 30 to allow for filtering duplicates.
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=30&accept-language=zh-CN`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Use a Map to deduplicate results based on the final display name
    const uniqueMap = new Map<string, LocationData>();

    data.forEach((item: any) => {
       const addr = item.address || {};
       
       const country = addr.country || '';
       // Adjust for municipalities like Shanghai/Beijing where state == city
       const state = addr.state || addr.province || ''; 
       const city = addr.city || addr.municipality || addr.prefecture || ''; 
       const district = addr.district || addr.county || addr.town || '';
       const name = item.name || '';

       let displayName = '';
       
       // Heuristic for Chinese Addresses to display: Province City District Name
       if (addr.country_code === 'cn') {
          const parts = [];
          
          // 1. Province/State
          if (state) parts.push(state);
          
          // 2. City
          // If city is same as state (Municipality), skip
          if (city && city !== state) {
              parts.push(city);
          }

          // 3. District/County
          // If district is same as city (rare but possible in bad data), skip
          if (district && district !== city) {
              parts.push(district);
          }
          
          // 4. Name (The POI or specific place)
          // Intelligently append name only if it adds new info
          const lastPart = parts[parts.length - 1];
          
          // Logic: If the 'name' (e.g. Yiwu) is essentially the same as the last part (e.g. Yiwu District), skip it.
          // Using includes() covers cases like Name="Yiwu" vs LastPart="Yiwu Shi"
          if (name) {
             const nameRedundant = lastPart && (lastPart.includes(name) || name.includes(lastPart));
             if (!nameRedundant) {
                parts.push(name);
             }
          }
          
          displayName = parts.join(' ');
       } else {
          // International: Simply join available parts
          const parts = [country, state, city, district, name].filter(Boolean);
          // Simple deduplication of parts for international
          displayName = [...new Set(parts)].join(' ');
       }
       
       if (!displayName) displayName = item.display_name;

       // Store in Map to ensure uniqueness. The first occurrence (usually highest rank) is kept.
       if (!uniqueMap.has(displayName)) {
           uniqueMap.set(displayName, {
             id: `${item.place_id}`,
             name: displayName,
             lat: parseFloat(item.lat),
             lon: parseFloat(item.lon),
             isCurrent: false
           });
       }
    });

    return Array.from(uniqueMap.values());

  } catch (e) {
    console.error("City search failed", e);
    return [];
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<Record<string, WeatherInfo>> => {
  try {
    // Open-Meteo API (Free, No Key required)
    // Updated: request forecast_days=16 (Today + 15 days) and past_days=15 (Previous 15 days)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=15&forecast_days=16`
    );
    
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const data = await response.json();
    const weatherMap: Record<string, WeatherInfo> = {};

    // Process Daily Forecast
    data.daily.time.forEach((dateStr: string, index: number) => {
      const code = data.daily.weather_code[index];
      const { description, iconType } = mapWmoCode(code);
      
      weatherMap[dateStr] = {
        tempMax: data.daily.temperature_2m_max[index],
        tempMin: data.daily.temperature_2m_min[index],
        code: code,
        description: description,
        iconType: iconType
      };
    });

    // Add Current Weather specific details to "Today"
    // Use local date string to match keys provided by API with timezone=auto
    const offset = new Date().getTimezoneOffset() * 60000;
    const todayStr = new Date(Date.now() - offset).toISOString().split('T')[0];
    
    if (weatherMap[todayStr]) {
      weatherMap[todayStr].currentTemp = data.current.temperature_2m;
      weatherMap[todayStr].humidity = data.current.relative_humidity_2m;
      weatherMap[todayStr].windSpeed = data.current.wind_speed_10m;
      weatherMap[todayStr].code = data.current.weather_code; 
      const currentMap = mapWmoCode(data.current.weather_code);
      weatherMap[todayStr].description = currentMap.description;
      weatherMap[todayStr].iconType = currentMap.iconType;
    }

    return weatherMap;
  } catch (error) {
    console.error("Weather Error:", error);
    return {};
  }
};

export const mapWmoCode = (code: number): { description: string; iconType: WeatherInfo['iconType'] } => {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  if (code === 0) return { description: '晴朗', iconType: 'sun' };
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if ([1, 2, 3].includes(code)) return { description: '多云', iconType: 'cloud' };
  
  // 45, 48: Fog and depositing rime fog
  if ([45, 48].includes(code)) return { description: '雾', iconType: 'fog' };
  
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 80, 81, 82: Rain showers
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { description: '有雨', iconType: 'rain' };
  
  // 56, 57, 66, 67, 71, 73, 75, 77, 85, 86: Snow
  if ([56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code)) return { description: '有雪', iconType: 'snow' };
  
  // 95, 96, 99: Thunderstorm
  if ([95, 96, 99].includes(code)) return { description: '雷雨', iconType: 'storm' };

  return { description: '多云', iconType: 'cloud' };
};