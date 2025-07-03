import { FaSearch, FaSpinner } from 'react-icons/fa';

interface ScrapingInputProps {
  scrapeUrl: string;
  secondaryUrl: string;
  scraping: boolean;
  canScrape: boolean;
  onScrapeUrlChange: (url: string) => void;
  onSecondaryUrlChange: (url: string) => void;
  onScrape: () => void;
}

export default function ScrapingInput({
  scrapeUrl,
  secondaryUrl,
  scraping,
  canScrape,
  onScrapeUrlChange,
  onSecondaryUrlChange,
  onScrape,
}: ScrapingInputProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Enter URLs to Scrape</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary URL (Station Website)
          </label>
          <input
            type="url"
            value={scrapeUrl}
            onChange={(e) => onScrapeUrlChange(e.target.value)}
            placeholder="https://stationwebsite.com - Best for contact info, description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary URL (Google Maps) <span className="text-gray-400">- Optional</span>
          </label>
          <input
            type="url"
            value={secondaryUrl}
            onChange={(e) => onSecondaryUrlChange(e.target.value)}
            placeholder="https://maps.app.goo.gl/... - Best for coordinates"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <button
          onClick={onScrape}
          disabled={!canScrape || scraping}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {scraping ? (
            <>
              <FaSpinner className="animate-spin" />
              Scraping URLs...
            </>
          ) : (
            <>
              <FaSearch />
              Scrape & Merge Information
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs font-medium text-blue-800 mb-2">💡 What gets scraped automatically:</p>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Station Website:</strong> Phone, email, description, social media, logo, favicon</p>
          <p><strong>Google Maps:</strong> Coordinates, address verification</p>
          <p><strong>🎨 NEW!</strong> Automatic logo and favicon detection from websites</p>
          <p>Data will be automatically merged from both sources!</p>
        </div>
      </div>
    </div>
  );
}