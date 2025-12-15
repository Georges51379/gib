import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown';
};

const getGeolocation = async (): Promise<{
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
} | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-geolocation');
    if (error) {
      console.error('Geolocation error:', error);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const usePageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin routes
    if (location.pathname.startsWith('/admin')) return;

    const trackPageView = async () => {
      try {
        // Get geolocation data
        const geoData = await getGeolocation();

        const eventData = {
          device_type: getDeviceType(),
          browser: getBrowserName(),
          screen_width: window.innerWidth,
          screen_height: window.innerHeight,
          language: navigator.language,
          // Add geolocation data
          country: geoData?.country || 'Unknown',
          country_code: geoData?.countryCode || 'XX',
          region: geoData?.region || 'Unknown',
          city: geoData?.city || 'Unknown',
          lat: geoData?.lat || 0,
          lon: geoData?.lon || 0,
        };

        await supabase.from('analytics_events').insert({
          event_type: 'page_view',
          page_path: location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          event_data: eventData,
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
