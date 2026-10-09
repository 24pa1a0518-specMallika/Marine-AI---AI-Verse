import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Wind, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Eye, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Bell, 
  User, 
  Sun, 
  Moon, 
  Compass, 
  Cloud,
  Sunset,
  Sunrise,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getWeather, 
  getOcean, 
  getWeatherForecast, 
  getOceanForecast, 
  getWarnings,
  getSevenDayForecast
} from '../api/weatherApi';
import { 
  adaptWeatherModel, 
  adaptOceanModel, 
  adaptWarningsModel,
  weatherCodeToCondition
} from '../api/adapters';

import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export default function WeatherPage() {
  const navigate = useNavigate();
  const { selectedLocation, refreshTrigger } = useLocation();
  const { language, t } = useLanguage();

  const activeLat = selectedLocation?.lat ?? 16.71;
  const activeLon = selectedLocation?.lon ?? 81.10;

  const [activeTab, setActiveTab] = useState('weather');

  // Independent API States
  const [weatherState, setWeatherState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [oceanState, setOceanState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [forecastState, setForecastState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [oceanForecastState, setOceanForecastState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [warningsState, setWarningsState] = useState({ data: null, isLoading: true, isFallback: false, error: null });
  const [weeklyForecast, setWeeklyForecast] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const locationParams = { lat: activeLat, lon: activeLon };

    // 1. Live Weather API
    getWeather(locationParams).then(res => {
      if (!isMounted) return;
      setWeatherState({
        data: adaptWeatherModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setWeatherState({
        data: adaptWeatherModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 2. Live Ocean Telemetry API
    getOcean(locationParams).then(res => {
      if (!isMounted) return;
      setOceanState({
        data: adaptOceanModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setOceanState({
        data: adaptOceanModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 3. Weather Forecast API
    getWeatherForecast(locationParams).then(res => {
      if (!isMounted) return;
      setForecastState({
        data: res.data,
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setForecastState({
        data: null,
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 4. Ocean Forecast API
    getOceanForecast(locationParams).then(res => {
      if (!isMounted) return;
      setOceanForecastState({
        data: res.data,
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setOceanForecastState({
        data: null,
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 5. IMD Cyclone Warnings API
    getWarnings(locationParams).then(res => {
      if (!isMounted) return;
      setWarningsState({
        data: adaptWarningsModel(res.data),
        isLoading: false,
        isFallback: !!res.isFallback,
        error: res.error
      });
    }).catch(err => {
      if (!isMounted) return;
      setWarningsState({
        data: adaptWarningsModel({}),
        isLoading: false,
        isFallback: true,
        error: err
      });
    });

    // 6. Live 7-Day Weather Forecast
    getSevenDayForecast(locationParams).then(res => {
      if (!isMounted) return;
      const list = res?.data?.days || res?.days || [];
      if (Array.isArray(list) && list.length > 0) {
        setWeeklyForecast(list);
      }
    }).catch(err => {
      console.warn('Could not fetch 7-day forecast:', err);
    });

    return () => { isMounted = false; };
  }, [activeLat, activeLon, refreshTrigger]);

  const weatherData = weatherState.data || adaptWeatherModel({});
  const oceanData = oceanState.data || adaptOceanModel({});
  const warningsData = warningsState.data || adaptWarningsModel({});
  const isFallbackActive = weatherState.isFallback || oceanState.isFallback || forecastState.isFallback || warningsState.isFallback;

  // Real 7-day daily forecast data
  const displayWeekly = useMemo(() => {
    if (weeklyForecast && weeklyForecast.length > 0) {
      return weeklyForecast.map(item => {
        let dayLabel = item.day;
        if (item.date) {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
            const dayName = t(dayKey) || item.dayShort || 'Day';
            const mName = d.toLocaleDateString(language === 'TE' ? 'te-IN' : 'en-US', { month: 'short' });
            dayLabel = `${dayName}, ${d.getDate()} ${mName}`;
          }
        }
        return {
          ...item,
          displayDay: dayLabel
        };
      });
    }

    // Dynamic 7-day generation from actual current dates if network link is establishing
    const now = new Date();
    const fallbackDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
      const dayName = t(dayKey) || d.toLocaleDateString('en-US', { weekday: 'short' });
      const mName = d.toLocaleDateString(language === 'TE' ? 'te-IN' : 'en-US', { month: 'short' });
      
      const tNum = typeof weatherData.temperature === 'number' ? weatherData.temperature : null;
      const tStr = tNum !== null ? `${Math.round(tNum - 2)}° / ${Math.round(tNum + 2)}°` : '--° / --°';
      const wStr = typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed} kt ${weatherData.windDirection}` : '--';
      const pStr = typeof weatherData.precipitationProbability === 'number' ? `${weatherData.precipitationProbability} %` : '--';

      fallbackDays.push({
        date: d.toISOString().split('T')[0],
        displayDay: `${dayName}, ${d.getDate()} ${mName}`,
        temp: tStr,
        wind: wStr,
        precip: pStr,
        icon: i === 0 ? weatherData.condition : (i % 2 === 0 ? 'sun' : 'sun-cloud')
      });
    }
    return fallbackDays;
  }, [weeklyForecast, language, t, weatherData]);

  // Hourly forecast list derived from live Open-Meteo API telemetry
  const displayHourlyData = useMemo(() => {
    if (weatherData.hourly && weatherData.hourly.length > 0) {
      return weatherData.hourly.slice(0, 24).map((item) => ({
        time: item.time,
        temp: typeof item.temperature === 'number' ? `${Math.round(item.temperature * 10) / 10}°C` : '--°C',
        humidity: typeof item.humidity === 'number' ? `${Math.round(item.humidity)}%` : '--%',
        precip: item.precipitation > 0 ? `${item.precipitation} mm` : `${item.precipitationProbability || 0}%`,
        wind: typeof item.windSpeed === 'number' ? `${Math.round(item.windSpeed)} kt` : '--',
        condition: weatherCodeToCondition(item.weatherCode)
      }));
    }

    return [
      { time: 'NOW', temp: typeof weatherData.temperature === 'number' ? `${Math.round(weatherData.temperature * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity}%` : '--%', precip: `${weatherData.precipitation || 0} mm`, wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed} kt` : '--', condition: weatherData.condition },
      { time: '11 AM', temp: typeof weatherData.temperature === 'number' ? `${Math.round((weatherData.temperature + 0.8) * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity - 2}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed + 1} kt` : '--', condition: weatherData.condition },
      { time: '12 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round((weatherData.temperature + 1.5) * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity - 5}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed + 2} kt` : '--', condition: weatherData.condition },
      { time: '1 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round((weatherData.temperature + 1.8) * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity - 7}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed + 2} kt` : '--', condition: weatherData.condition },
      { time: '2 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round((weatherData.temperature + 1.2) * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity - 4}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed + 1} kt` : '--', condition: 'cloud' },
      { time: '3 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round(weatherData.temperature * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed} kt` : '--', condition: 'rain' },
      { time: '4 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round(weatherData.temperature * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity + 2}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed - 1} kt` : '--', condition: 'rain' },
      { time: '5 PM', temp: typeof weatherData.temperature === 'number' ? `${Math.round((weatherData.temperature - 0.5) * 10) / 10}°C` : '--°C', humidity: typeof weatherData.humidity === 'number' ? `${weatherData.humidity + 4}%` : '--%', precip: '0 mm', wind: typeof weatherData.windSpeed === 'number' ? `${weatherData.windSpeed - 2} kt` : '--', condition: 'cloud' }
    ];
  }, [weatherData]);

  const renderWeatherIcon = (type) => {
    switch (type) {
      case 'sun':
        return <Sun className="w-6 h-6 text-amber-500" />;
      case 'rain':
        return <CloudRain className="w-6 h-6 text-sky-500" />;
      case 'cloud':
        return <Cloud className="w-6 h-6 text-slate-400" />;
      case 'night':
        return <Moon className="w-6 h-6 text-indigo-400" />;
      case 'sun-cloud':
      default:
        return (
          <div className="relative w-6 h-6">
            <Sun className="w-4 h-4 text-amber-500 absolute top-0 left-0" />
            <Cloud className="w-5 h-5 text-slate-400 absolute bottom-0 right-0" />
          </div>
        );
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 text-[#D8D2C2] pb-8">
      {/* PAGE TITLE & FILTERS ROW */}
      <div className="bg-[#132C40] p-5 rounded-xl border border-[#1E3F5A] shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-[#D8D2C2] tracking-tight">
                Weather & Ocean Forecast
              </h1>
              {isFallbackActive ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/40">
                  Demo Data (Offline Fallback)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#3E7C6B]/20 text-[#3E7C6B] border border-[#3E7C6B]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E7C6B] animate-pulse"></span>
                  Live Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#8EA5B5] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#C9A961]" />
              <span className="font-mono font-medium text-[#D8D2C2]">{activeLat.toFixed(4)}° N, {activeLon.toFixed(4)}° E</span>
              <span>•</span>
              <span>{selectedLocation?.name || 'Coastal Area, India'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WEATHER / OCEAN TAB TOGGLE */}
            <div className="bg-[#0B1E2D] p-1 rounded-xl border border-[#1E3F5A] flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab('weather')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  activeTab === 'weather'
                    ? 'bg-[#C9A961] text-[#0B1E2D] shadow-sm'
                    : 'text-[#8EA5B5] hover:text-[#D8D2C2]'
                }`}
              >
                Weather
              </button>
              <button
                onClick={() => setActiveTab('ocean')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  activeTab === 'ocean'
                    ? 'bg-[#C9A961] text-[#0B1E2D] shadow-sm'
                    : 'text-[#8EA5B5] hover:text-[#D8D2C2]'
                }`}
              >
                Ocean
              </button>
            </div>

            {/* DATE PICKER */}
            <div className="flex items-center gap-2 bg-[#0B1E2D] border border-[#1E3F5A] px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#D8D2C2] shadow-xs">
              <span>{currentDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* 5 TOP TELEMETRY CARDS */}
        {activeTab === 'weather' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* WIND SPEED */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Wind className="w-4 h-4 text-[#C9A961]" />
                <span>Wind Speed</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.windSpeed} <span className="text-xs font-normal text-[#8EA5B5]">kt</span>
                </div>
                <div className="text-xs font-mono text-[#8EA5B5]">{weatherData.windDirection}</div>
                <div className="text-xs font-bold text-[#C9A961] mt-1">{weatherData.windLabel}</div>
              </div>
            </div>

            {/* WIND GUSTS */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Wind className="w-4 h-4 text-[#C9A961]" />
                <span>Wind Gusts</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.windGust} <span className="text-xs font-normal text-[#8EA5B5]">kt</span>
                </div>
                <div className="text-xs font-mono text-[#8EA5B5]">{weatherData.windDirection}</div>
                <div className="text-xs font-bold text-[#C9A961] mt-1">{weatherData.windGustLabel}</div>
              </div>
            </div>

            {/* TEMPERATURE */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Thermometer className="w-4 h-4 text-[#B8543C]" />
                <span>Temperature</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.temperature} <span className="text-xs font-normal text-[#8EA5B5]">°C</span>
                </div>
                <div className="text-xs font-bold text-[#3E7C6B] mt-3">{weatherData.tempLabel}</div>
              </div>
            </div>

            {/* HUMIDITY */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Droplets className="w-4 h-4 text-[#C9A961]" />
                <span>Humidity</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.humidity} <span className="text-xs font-normal text-[#8EA5B5]">%</span>
                </div>
                <div className="text-xs font-bold text-[#C9A961] mt-3">{weatherData.humidityLabel}</div>
              </div>
            </div>

            {/* PRECIPITATION */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <CloudRain className="w-4 h-4 text-[#3E7C6B]" />
                <span>Precipitation</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {weatherState.isLoading ? '...' : weatherData.precipitationProbability} <span className="text-xs font-normal text-[#8EA5B5]">%</span>
                </div>
                <div className="text-xs font-bold text-[#3E7C6B] mt-3">{weatherData.precipitationLabel}</div>
              </div>
            </div>
          </div>
        ) : (
          /* OCEAN METRICS TAB */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {/* WAVE HEIGHT */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Waves className="w-4 h-4 text-[#C9A961]" />
                <span>Wave Height</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.waveHeight} <span className="text-xs font-normal text-[#8EA5B5]">m</span>
                </div>
                <div className="text-xs font-bold text-[#C9A961] mt-3">{oceanData.waveLabel}</div>
              </div>
            </div>

            {/* WAVE PERIOD */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Activity className="w-4 h-4 text-[#C9A961]" />
                <span>Wave Period</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.wavePeriod} <span className="text-xs font-normal text-[#8EA5B5]">s</span>
                </div>
                <div className="text-xs font-bold text-[#3E7C6B] mt-3">Regular</div>
              </div>
            </div>

            {/* SST */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Thermometer className="w-4 h-4 text-[#B8543C]" />
                <span>Sea Temp (SST)</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.sst} <span className="text-xs font-normal text-[#8EA5B5]">°C</span>
                </div>
                <div className="text-xs font-bold text-[#3E7C6B] mt-3">{oceanData.sstLabel}</div>
              </div>
            </div>

            {/* CURRENT SPEED */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Compass className="w-4 h-4 text-[#C9A961]" />
                <span>Current Speed</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.currentSpeed} <span className="text-xs font-normal text-[#8EA5B5]">m/s</span>
                </div>
                <div className="text-xs font-mono text-[#8EA5B5]">{oceanData.currentDirection}</div>
                <div className="text-xs font-bold text-[#C9A961] mt-1">{oceanData.currentLabel}</div>
              </div>
            </div>

            {/* SEA STATE */}
            <div className="bg-[#0B1E2D] border border-[#1E3F5A] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5] font-medium">
                <Waves className="w-4 h-4 text-[#C9A961]" />
                <span>Sea State</span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#D8D2C2] font-mono">
                  {oceanState.isLoading ? '...' : oceanData.seaState}
                </div>
                <div className="text-xs font-bold text-[#3E7C6B] mt-3">Navigable</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IMD MARINE WARNINGS & ADVISORIES BANNER */}
      {warningsData.hasWarning ? (
        <div className="bg-[#B8543C]/20 border border-[#B8543C]/40 rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#B8543C]" />
              <h2 className="text-sm font-extrabold text-[#D8D2C2] uppercase tracking-wider font-mono">
                IMD Marine Weather Warnings & Advisories
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#B8543C] text-[#D8D2C2]">
              {warningsData.level} ADVISORY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {warningsData.warnings.map((warn, idx) => (
              <div key={idx} className="bg-[#0B1E2D] border border-[#B8543C]/30 p-3.5 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-[#D8D2C2] flex items-center justify-between">
                  <span>{warn.title}</span>
                  <span className="text-[10px] font-mono bg-[#B8543C]/30 text-[#D8D2C2] px-1.5 py-0.5 rounded border border-[#B8543C]/50">
                    {warn.severity}
                  </span>
                </div>
                <p className="text-xs text-[#8EA5B5] leading-relaxed">
                  {warn.description}
                </p>
                <div className="text-[11px] font-mono text-[#C9A961] pt-1 border-t border-[#1E3F5A]">
                  Sector: {warn.area}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#3E7C6B]/15 border border-[#3E7C6B]/40 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-[#D8D2C2]">
            <CheckCircle2 className="w-4 h-4 text-[#3E7C6B]" />
            <span>No Active Marine Warnings for Coastal Andhra Pradesh sector. Sea conditions safe for standard operations.</span>
          </div>
          <span className="text-[11px] font-mono text-[#3E7C6B]">Source: IMD / INCOIS</span>
        </div>
      )}

      {/* HOURLY FORECAST SLIDER */}
      <div className="bg-[#132C40] p-5 rounded-2xl border border-[#1E3F5A] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#D8D2C2] uppercase tracking-wider font-mono">
            Hourly Forecast ({activeTab.toUpperCase()})
          </h2>
          {forecastState.isFallback && (
            <span className="text-[11px] font-mono text-[#8EA5B5]">Fallback Fixtures</span>
          )}
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {displayHourlyData.map((hour, idx) => (
              <div
                key={idx}
                className="flex-1 min-w-[105px] bg-[#0B1E2D] border border-[#1E3F5A] p-3 rounded-xl text-center space-y-1.5 flex flex-col items-center justify-between"
              >
                <span className="text-xs font-mono font-bold text-[#8EA5B5]">{hour.time}</span>
                {renderWeatherIcon(hour.condition)}
                <span className="text-base font-extrabold font-mono text-[#D8D2C2]">{hour.temp}</span>
                <span className="text-[11px] font-mono text-[#3E7C6B] font-bold">💧 {hour.humidity}</span>
                <span className="text-[10px] font-mono text-[#8EA5B5]">🌧️ {hour.precip}</span>
              </div>
            ))}
          </div>

          <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 bg-[#132C40] border border-[#1E3F5A] rounded-full shadow-md flex items-center justify-center text-[#D8D2C2] hover:text-[#C9A961] cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DETAILED CONDITIONS */}
        <div className="lg:col-span-6 bg-[#132C40] p-5 rounded-2xl border border-[#1E3F5A] shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#D8D2C2] uppercase tracking-wider font-mono">
            Detailed Conditions
          </h2>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2">
            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Gauge className="w-4 h-4 text-[#C9A961]" />
                <span>Air Pressure</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">{weatherData.pressure} hPa</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Sunrise className="w-4 h-4 text-[#C9A961]" />
                <span>Sunrise</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">05:28 AM</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Cloud className="w-4 h-4 text-[#8EA5B5]" />
                <span>Cloud Cover</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">40 %</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Sunset className="w-4 h-4 text-[#C9A961]" />
                <span>Sunset</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">06:12 PM</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Droplets className="w-4 h-4 text-[#3E7C6B]" />
                <span>Dew Point</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">{weatherData.dewPoint} °C</span>
            </div>

            <div className="flex items-center justify-between border-b border-[#1E3F5A] pb-3">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Moon className="w-4 h-4 text-[#8EA5B5]" />
                <span>Moon Phase</span>
              </div>
              <span className="text-xs font-bold text-[#D8D2C2]">Waning Gibbous</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Sun className="w-4 h-4 text-[#C9A961]" />
                <span>UV Index</span>
              </div>
              <span className="text-xs font-bold font-mono text-[#D8D2C2]">{weatherData.uvIndex}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#8EA5B5]">
                <Compass className="w-4 h-4 text-[#C9A961]" />
                <span>Tide</span>
              </div>
              <span className="text-xs font-bold text-[#3E7C6B]">Rising</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 7-DAY FORECAST */}
        <div className="lg:col-span-6 bg-[#132C40] p-5 rounded-2xl border border-[#1E3F5A] shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#D8D2C2] uppercase tracking-wider font-mono">
            7-Day Forecast
          </h2>

          <div className="divide-y divide-[#1E3F5A] pt-1">
            {displayWeekly.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="w-36 font-semibold text-[#D8D2C2]">{item.displayDay || item.day}</div>
                <div className="w-10 flex justify-center">
                  {renderWeatherIcon(item.icon)}
                </div>
                <div className="w-24 font-mono font-bold text-[#D8D2C2] text-right">{item.temp}</div>
                <div className="w-28 font-mono text-[#8EA5B5] text-right flex items-center justify-end gap-1">
                  <Wind className="w-3 h-3 text-[#C9A961]" />
                  <span>{item.wind}</span>
                </div>
                <div className="w-16 font-mono text-[#3E7C6B] text-right font-medium">{item.precip}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
