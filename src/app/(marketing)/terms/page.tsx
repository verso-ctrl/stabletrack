import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-card">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-amber-600 hover:text-amber-700 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-stone max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: January 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using StableTrack, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              StableTrack provides horse farm management software including horse tracking, health records, 
              scheduling, billing, and team collaboration features. Features may vary based on your subscription plan.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use StableTrack, you must:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users' use of the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground mb-4">
              For paid subscriptions:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Fees are billed in advance on a monthly or annual basis</li>
              <li>All fees are non-refundable except as required by law or stated in our refund policy</li>
              <li>We may change pricing with 30 days notice</li>
              <li>You authorize us to charge your payment method for recurring fees</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Ownership</h2>
            <p className="text-muted-foreground">
              You retain all rights to the data you enter into StableTrack. We claim no ownership over your content. 
              You grant us a license to use your data solely for the purpose of providing and improving our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. 
              We may suspend service for maintenance, updates, or circumstances beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              StableTrack is provided "as is" without warranties of any kind. We are not liable for any 
              indirect, incidental, or consequential damages arising from your use of the service. 
              Our total liability shall not exceed the amount paid by you in the past 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              You may cancel your account at any time. We may terminate or suspend your account for 
              violations of these terms. Upon termination, your right to use the service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may modify these terms at any time. We will notify you of material changes via email or 
              through the service. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at legal@stabletrack.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
