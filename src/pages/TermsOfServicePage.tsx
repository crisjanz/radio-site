export default function TermsOfServicePage() {

  return (
    <div className="p-6 pb-24">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <p className="text-sm text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Streemr ("the Service"), you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                Streemr is a radio streaming aggregation service that provides access to publicly 
                available radio station streams from around the world. We do not host, own, or 
                control the radio content - we simply provide links to streams that are publicly 
                available on the internet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Content and Copyright</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">Radio Stream Content</h3>
              <p className="text-gray-700 mb-4">
                All radio content, including music, talk shows, advertisements, and other audio 
                content, is owned by the respective radio stations and content creators. Streemr 
                does not claim ownership of any radio content.
              </p>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">User-Generated Content</h3>
              <p className="text-gray-700 mb-4">
                Users may submit station information, corrections, or feedback. By submitting 
                content, you grant Streemr a non-exclusive, royalty-free license to use, modify, 
                and display such content for the purpose of improving the service.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-3">DMCA Compliance</h3>
              <p className="text-gray-700 mb-4">
                If you believe that content accessible through our service infringes your copyright, 
                please contact us at dmca@streemr.app with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Description of the copyrighted work claimed to be infringed</li>
                <li>URL or description of where the infringing material is located</li>
                <li>Your contact information and electronic signature</li>
                <li>A statement of good faith belief that the use is not authorized</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Use the service for personal, non-commercial purposes only</li>
                <li>Not attempt to access restricted areas of the service</li>
                <li>Not interfere with or disrupt the service or servers</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not redistribute or rebroadcast radio streams without permission</li>
                <li>Respect intellectual property rights of content creators</li>
                <li>Provide accurate information when creating an account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to maintain service availability, but cannot guarantee uninterrupted access. 
                The service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintenance and updates</li>
                <li>Technical difficulties</li>
                <li>Third-party service outages</li>
                <li>Radio station stream unavailability</li>
                <li>Network connectivity issues</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy and Data</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the service, to understand our practices regarding your 
                personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitations</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-3">Service Disclaimer</h3>
              <p className="text-gray-700 mb-4">
                The service is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Accuracy of station information or stream availability</li>
                <li>Quality or content of radio streams</li>
                <li>Uninterrupted or error-free service</li>
                <li>Security from viruses or other harmful components</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-3">Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                Streemr shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including but not limited to loss of profits, data, or use, 
                incurred by you or any third party, whether in an action in contract or tort.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our service integrates with third-party services including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Radio station streaming services</li>
                <li>Google Analytics for usage analytics</li>
                <li>Google AdSense for advertisements</li>
                <li>Radio directory APIs for station data</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These third parties have their own terms of service and privacy policies. 
                We are not responsible for their practices or content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Account Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend your account and access to the service 
                immediately, without prior notice, for conduct that we believe violates these terms 
                or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The Streemr website design, logo, and original content are owned by Streemr. 
                All radio content remains the property of respective radio stations and content creators. 
                Users may not reproduce, distribute, or create derivative works without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibond text-gray-900 mb-4">11. Geographic Restrictions</h2>
              <p className="text-gray-700 mb-4">
                Some radio streams may have geographic restrictions imposed by the radio stations 
                themselves. We do not control these restrictions and are not responsible for 
                streams that may be unavailable in your location.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to the website. Your continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms shall be governed by and construed in accordance with applicable laws. 
                Any disputes arising from these terms or use of the service shall be resolved 
                through binding arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@streemr.app<br />
                  <strong>DMCA:</strong> dmca@streemr.app<br />
                  <strong>Website:</strong> https://streemr.app<br />
                  <strong>Support:</strong> support@streemr.app
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-600">
                By using Streemr, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service. These terms complement our Privacy Policy and 
                together constitute the complete agreement between you and Streemr.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}