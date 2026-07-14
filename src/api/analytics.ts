import { executeCmd } from './client';

/**
 * Captures visitor traffic data.
 * Implements a cooldown to prevent duplicate entries.
 * Cooldown duration: 6 hours.
 */
export const trackUserTraffic = async () => {
  const COOLDOWN_KEY = 'analytics_last_visit';
  const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

  const lastVisit = localStorage.getItem(COOLDOWN_KEY);
  const now = Date.now();

  if (lastVisit && (now - parseInt(lastVisit, 10)) < COOLDOWN_MS) {
    // Still within the cooldown period
    return;
  }

  try {
    await executeCmd('ANALYTICS:track-visit', {
      visit_data: {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        type: 'web_visit'
      }
    });
    
    // Update last visit timestamp upon successful tracking
    localStorage.setItem(COOLDOWN_KEY, now.toString());
    console.log('🚀 Traffic analytics captured.');
  } catch (error) {
    console.error('Failed to capture traffic analytics:', error);
  }
};
