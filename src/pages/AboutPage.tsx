import { FaHeart, FaGlobe } from 'react-icons/fa6';
// import AdBanner from '../components/AdBanner';

export default function AboutPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">About Streemr</h1>
          <p className="text-lg text-gray-600">
            Discover radio stations from every corner of the world, without the noise.
          </p>
        </div>

        {/* Main Story */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Streemr Exists</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              I've always been passionate about radio. There's something magical about tuning into stations 
              from different countries and discovering new music, voices, and cultures. Growing up in South America, 
              I was fascinated by the incredible variety of radio stations scattered across every corner of 
              the continent—each with its own personality and local flavor.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              After moving to Canada in 2007, I found myself using platforms like TuneIn regularly, both at home 
              and in my car. But there was always one thing that bothered me: the constant audio advertisements 
              interrupting my listening experience. These ads would break the flow of discovery and take away 
              from the pure joy of radio exploration.
            </p>
            <p className="text-gray-700 leading-relaxed">
              That's when I decided to build Streemr—a platform that puts the listening experience first, 
              with advertising that's discreet and never interrupts your music.
            </p>
          </div>
        </div>

        {/* Ad Banner - Responsive */}
        <div className="flex justify-center">
          <div 
            style={{ 
              width: '100%',
              maxWidth: '728px',
              height: '90px',
              backgroundColor: '#f8f9fa',
              border: '1px dashed #e9ecef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#6c757d'
            }}
          >
            About Page Ad Space
          </div>
        </div>

        {/* What Makes Streemr Different */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">What Makes Streemr Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audio Ads</h3>
              <p className="text-gray-700">
                Listen without interruption. Our advertising is visual and discreet, never breaking 
                your music flow.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Always Free</h3>
              <p className="text-gray-700">
                Save your favorite stations, create playlists, and access all features without 
                paying or upgrading.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">App-Like Experience</h3>
              <p className="text-gray-700">
                Clean, intuitive navigation that works seamlessly on desktop and mobile. 
                Simple enough for anyone to use.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Discovery</h3>
              <p className="text-gray-700">
                Explore stations from every corner of the world. Discover new cultures 
                through their radio waves.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Instant Streaming</h4>
                <p className="text-gray-700">Click and play—no registration required to start listening</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Smart Search</h4>
                <p className="text-gray-700">Find stations by name, genre, country, or language</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Favorites System</h4>
                <p className="text-gray-700">Save your go-to stations and sync across all your devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Interactive Map</h4>
                <p className="text-gray-700">Discover stations geographically—explore the world through radio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold text-gray-900">Community Driven</h4>
                <p className="text-gray-700">Submit your favorite local stations to help grow our global catalog</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Vision</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Right now, Streemr is a solo project—built by one person who loves radio. But I have big dreams. 
            My hope is that this platform will grow large enough to generate the revenue needed to expand 
            the team, improve the technology, and truly make Streemr a global destination for radio discovery.
          </p>
          <p className="text-gray-700 leading-relaxed">
            I want to create something that radio enthusiasts around the world can call home—a place where 
            discovering new stations is as easy as opening an app, and where the focus is always on the 
            music, not the interruptions.
          </p>
        </div>

        {/* Community */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join the Community</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Streemr is only as good as the stations we feature. Know a great local radio station that's 
            not in our catalog yet? I'd love to hear about it!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = '/submit-station'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit a Station
            </button>
            <button
              onClick={() => window.open('mailto:hello@streemr.com', '_blank')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get in Touch
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="flex items-center justify-center gap-2">
            Built with <FaHeart className="text-red-500" /> for radio lovers everywhere
          </p>
          <p className="text-sm mt-2 flex items-center justify-center gap-2">
            From South America to the world <FaGlobe className="text-blue-500" />
          </p>
        </div>
      </div>
    </div>
  );
}