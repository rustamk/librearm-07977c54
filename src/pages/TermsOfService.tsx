import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Scale, Heart, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - LibreArm</title>
        <meta name="description" content="LibreArm terms of service. Open source blood pressure monitoring app usage terms." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <Link 
              to="/" 
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>

            <h1 className="mb-2 text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="mb-8 text-muted-foreground">Last updated: December 2024</p>

            {/* Key Points */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Code className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Open Source</h3>
                  <p className="text-sm text-muted-foreground">Free to use and modify</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Personal Use</h3>
                  <p className="text-sm text-muted-foreground">For health tracking only</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Not Medical Advice</h3>
                  <p className="text-sm text-muted-foreground">Consult healthcare providers</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Scale className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">As-Is Software</h3>
                  <p className="text-sm text-muted-foreground">No warranties provided</p>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="mb-3 text-xl font-semibold">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By downloading, installing, or using LibreArm, you agree to be bound by these Terms 
                  of Service. If you do not agree to these terms, do not use the application.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  LibreArm is an open source application that connects to QardioArm blood pressure 
                  monitors via Bluetooth to record and display blood pressure readings. The app stores 
                  data locally on your device and optionally syncs with Health Connect on Android.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">3. Medical Disclaimer</h2>
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 mb-3">
                  <p className="text-sm text-warning font-medium">
                    Important: LibreArm is not a medical device and is not intended to diagnose, 
                    treat, cure, or prevent any disease or health condition.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  The readings and information provided by this app are for personal reference only. 
                  Always consult with qualified healthcare professionals for medical advice, diagnosis, 
                  or treatment. Do not make health decisions based solely on information from this app.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">4. Open Source License</h2>
                <p className="text-muted-foreground">
                  LibreArm is open source software. You are free to use, modify, and distribute the 
                  software in accordance with the project&apos;s license terms available on GitHub. 
                  The source code is provided for transparency and community contribution.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">5. No Warranty</h2>
                <p className="text-muted-foreground">
                  LibreArm is provided &quot;as is&quot; without warranty of any kind, express or implied, 
                  including but not limited to the warranties of merchantability, fitness for a 
                  particular purpose, and noninfringement. The developers do not warrant that the 
                  app will be error-free or uninterrupted.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">6. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall the developers or contributors be liable for any direct, indirect, 
                  incidental, special, exemplary, or consequential damages arising from the use or 
                  inability to use the application, including but not limited to damages for loss of 
                  data or health complications.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">7. Device Compatibility</h2>
                <p className="text-muted-foreground">
                  LibreArm is designed to work with QardioArm blood pressure monitors. Compatibility 
                  with other devices is not guaranteed. The app requires Bluetooth Low Energy (BLE) 
                  support on your device. Health Connect integration is available on Android only.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">8. User Responsibilities</h2>
                <p className="text-muted-foreground">
                  You are responsible for maintaining your device&apos;s security and for any data 
                  exported from the app. You agree to use the app only for its intended purpose of 
                  personal health tracking and not for any unlawful activities.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">9. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  LibreArm is not affiliated with Qardio, Inc. or Google Health Connect. Use of 
                  third-party services is subject to their respective terms of service and privacy 
                  policies.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Changes will be reflected 
                  in the app and on the project repository. Continued use of the app after changes 
                  constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">11. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, please open an issue on our GitHub repository or 
                  contact the developer through the project page.
                </p>
              </section>

              <section className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <p className="text-sm text-primary">
                  <strong>Summary:</strong> LibreArm is free, open source software for personal health 
                  tracking. It is not medical advice. Use at your own risk and always consult healthcare 
                  professionals for medical decisions.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}