import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Smartphone, Database, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - LibreArm</title>
        <meta name="description" content="LibreArm privacy policy. Your health data stays on your device - we collect nothing." />
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

            <h1 className="mb-2 text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="mb-8 text-muted-foreground">Last updated: December 2024</p>

            {/* Key Points */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Smartphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Local Storage Only</h3>
                  <p className="text-sm text-muted-foreground">All data stays on your device</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">No Cloud Sync</h3>
                  <p className="text-sm text-muted-foreground">No servers, no accounts required</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">No Data Collection</h3>
                  <p className="text-sm text-muted-foreground">We collect zero personal data</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">100% Private</h3>
                  <p className="text-sm text-muted-foreground">Your health data is yours alone</p>
                </div>
              </div>
            </div>

            {/* Policy Content */}
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="mb-3 text-xl font-semibold">Overview</h2>
                <p className="text-muted-foreground">
                  LibreArm is designed with privacy as a core principle. We believe your health data 
                  belongs to you and only you. This app does not collect, transmit, or store any 
                  personal information on external servers.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Data Storage</h2>
                <p className="text-muted-foreground">
                  All blood pressure readings and health data are stored locally on your device using 
                  your browser&apos;s local storage or the native app&apos;s secure storage. This data never 
                  leaves your device unless you explicitly export it.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Health Connect Integration</h2>
                <p className="text-muted-foreground">
                  If you choose to sync with Health Connect (Android only), your data is shared 
                  directly between LibreArm and Health Connect on your device. This transfer happens 
                  locally and does not involve any external servers.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Bluetooth Permissions</h2>
                <p className="text-muted-foreground">
                  LibreArm requires Bluetooth permissions to connect to your QardioArm blood pressure 
                  monitor. This connection is direct between your device and the monitor. No Bluetooth 
                  data is transmitted to external parties.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Analytics and Tracking</h2>
                <p className="text-muted-foreground">
                  LibreArm does not include any analytics, tracking, or advertising SDKs. We do not 
                  track your usage, collect crash reports, or monitor your activity in any way.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Data Export</h2>
                <p className="text-muted-foreground">
                  You can export your readings as CSV or PDF files at any time. These exports are 
                  generated locally on your device. How you share or store these files is entirely 
                  your choice and responsibility.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Third-Party Services</h2>
                <p className="text-muted-foreground">
                  LibreArm does not integrate with any third-party services that collect user data. 
                  The app is fully self-contained and functions completely offline.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Open Source</h2>
                <p className="text-muted-foreground">
                  LibreArm is open source software. You can review the complete source code on GitHub 
                  to verify our privacy practices. Transparency is fundamental to our approach.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Contact</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this privacy policy, please open an issue on our 
                  GitHub repository or contact the developer through the project page.
                </p>
              </section>

              <section className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="text-sm text-success">
                  <strong>Summary:</strong> LibreArm collects no data. Your health information stays 
                  on your device. There are no accounts, no servers, and no tracking. Your privacy is 
                  guaranteed by design.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}