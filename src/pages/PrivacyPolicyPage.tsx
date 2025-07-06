export default function PrivacyPolicyPage() {

  return (
    <div className="p-6 pb-24">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Streemr ("we," "our," or "us"). This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website and use our 
                radio streaming service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Favorite radio stations</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">Automatically Collected Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain information when you visit our site:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Device information (browser type, operating system)</li>
                <li>IP address and general location data</li>
                <li>Radio station listening preferences and history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the collected information to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide and maintain our radio streaming service</li>
                <li>Manage your account and favorites</li>
                <li>Improve our website and user experience</li>
                <li>Analyze usage patterns and service performance</li>
                <li>Communicate with you about service updates</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">Google Analytics</h3>
              <p className="text-gray-700 mb-4">
                We use Google Analytics to understand how visitors use our site. Google Analytics 
                collects information such as how often users visit the site, what pages they visit, 
                and what other sites they used prior to coming to our site.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">Google AdSense</h3>
              <p className="text-gray-700 mb-4">
                We use Google AdSense to display advertisements. Google may use cookies to serve 
                ads based on your prior visits to our website or other websites. You may opt out 
                of personalized advertising by visiting Google's Ad Settings.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">Radio Station Data</h3>
              <p className="text-gray-700 mb-4">
                We integrate with radio streaming services and directories to provide station 
                information and stream URLs. No personal data is shared with these services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Keep you logged in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze site usage and performance</li>
                <li>Serve relevant advertisements</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings, but disabling cookies may 
                affect site functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may 
                share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>With service providers who assist in operating our website</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encrypted password storage</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security updates and monitoring</li>
                <li>Limited access to personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your 
                own. We ensure appropriate safeguards are in place to protect your data during 
                such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13. We do not knowingly collect 
                personal information from children under 13. If you become aware that a child 
                has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last 
                updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@streemr.app<br />
                  <strong>Website:</strong> https://streemr.app
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-600">
                This privacy policy complies with GDPR, CCPA, and other applicable privacy laws. 
                By using Streemr, you consent to the collection and use of information as described in this policy.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}