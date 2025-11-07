interface Metric {
  name: string;
  value: number;
  id: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

type ReportCallback = (metric: Metric) => void;

/**
 * Web Vitals thresholds for rating
 */
const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

/**
 * Get rating based on metric value
 */
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!thresholds) return 'good';

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Log Web Vitals to console in development
 */
function logMetric(metric: Metric): void {
  const rating = getRating(metric.name, metric.value);
  const color =
    rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';

  console.log(`${color} [Web Vitals] ${metric.name}:`, {
    value: metric.value,
    rating,
    id: metric.id,
  });
}

/**
 * Report Web Vitals metrics
 * Supports both Core Web Vitals (LCP, FID/INP, CLS) and other metrics (FCP, TTFB)
 */
const reportWebVitals = (onPerfEntry?: ReportCallback): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    void import('web-vitals').then(webVitals => {
      // Core Web Vitals
      webVitals.onCLS(metric => {
        const enhanced = { ...metric, rating: getRating('CLS', metric.value) };
        onPerfEntry(enhanced);
        if (process.env.NODE_ENV === 'development') logMetric(enhanced);
      });

      webVitals.onINP(metric => {
        const enhanced = { ...metric, rating: getRating('INP', metric.value) };
        onPerfEntry(enhanced);
        if (process.env.NODE_ENV === 'development') logMetric(enhanced);
      });

      webVitals.onLCP(metric => {
        const enhanced = { ...metric, rating: getRating('LCP', metric.value) };
        onPerfEntry(enhanced);
        if (process.env.NODE_ENV === 'development') logMetric(enhanced);
      });

      // Other important metrics
      webVitals.onFCP(metric => {
        const enhanced = { ...metric, rating: getRating('FCP', metric.value) };
        onPerfEntry(enhanced);
        if (process.env.NODE_ENV === 'development') logMetric(enhanced);
      });

      webVitals.onTTFB(metric => {
        const enhanced = { ...metric, rating: getRating('TTFB', metric.value) };
        onPerfEntry(enhanced);
        if (process.env.NODE_ENV === 'development') logMetric(enhanced);
      });
    });
  }
};

export default reportWebVitals;
