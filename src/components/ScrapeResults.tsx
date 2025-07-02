import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  source?: string;
}

interface ScrapeResultsProps {
  scrapeResult: ScrapeResult | null;
  secondaryResult: ScrapeResult | null;
  onManualEntry: () => void;
}

export default function ScrapeResults({
  scrapeResult,
  secondaryResult,
  onManualEntry,
}: ScrapeResultsProps) {
  if (!scrapeResult && !secondaryResult) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Scrape Results</h2>
      
      <div className="space-y-3">
        {/* Primary URL Results */}
        {scrapeResult && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Primary URL Results:</p>
            {scrapeResult.success ? (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FaCheckCircle className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Successfully scraped data</p>
                  <p className="text-sm text-green-700">
                    Found information from {scrapeResult.source || 'web source'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <FaExclamationTriangle className="text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Primary scraping failed</p>
                  <p className="text-sm text-red-700">{scrapeResult.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Secondary URL Results */}
        {secondaryResult && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Secondary URL Results:</p>
            {secondaryResult.success ? (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FaCheckCircle className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Successfully scraped coordinates</p>
                  <p className="text-sm text-green-700">
                    Found location data from {secondaryResult.source || 'secondary source'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <FaExclamationTriangle className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Secondary scraping failed</p>
                  <p className="text-sm text-yellow-700">{secondaryResult.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Merged Results Info */}
        {(scrapeResult?.success || secondaryResult?.success) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">📊 Data Merged Successfully</p>
            <p className="text-xs text-blue-700">
              Information from both sources has been combined. Review the preview below and save when ready.
            </p>
          </div>
        )}

        {/* Manual Entry Fallback */}
        {scrapeResult && !scrapeResult.success && (!secondaryResult || !secondaryResult.success) && (
          <div className="mt-3">
            <button
              onClick={onManualEntry}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              📝 Enter information manually instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}