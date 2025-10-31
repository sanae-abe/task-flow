interface Metric {
  name: string;
  value: number;
  id: string;
}

type ReportCallback = (metric: Metric) => void;

const reportWebVitals = (onPerfEntry?: ReportCallback): void => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    void import('web-vitals').then(webVitals => {
      if (webVitals.onCLS) {
        webVitals.onCLS(onPerfEntry);
      }
      if (webVitals.onFID) {
        webVitals.onFID(onPerfEntry);
      }
      if (webVitals.onFCP) {
        webVitals.onFCP(onPerfEntry);
      }
      if (webVitals.onLCP) {
        webVitals.onLCP(onPerfEntry);
      }
      if (webVitals.onTTFB) {
        webVitals.onTTFB(onPerfEntry);
      }
    });
  }
};

export default reportWebVitals;
