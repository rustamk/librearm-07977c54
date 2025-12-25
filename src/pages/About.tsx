import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Github, ExternalLink, Bluetooth, Smartphone, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - LibreArm</title>
        <meta name="description" content="About LibreArm - Open source blood pressure monitoring app for QardioArm devices." />
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

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-destructive/20">
                <Activity className="h-10 w-10 text-primary" />
              </div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">LibreArm</h1>
              <p className="text-muted-foreground">Version 1.0.0</p>
            </div>

            {/* Features */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
                <Bluetooth className="h-6 w-6 text-primary" />
                <h3 className="font-medium text-foreground">Bluetooth</h3>
                <p className="text-xs text-muted-foreground">Connect to QardioArm</p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
                <Smartphone className="h-6 w-6 text-primary" />
                <h3 className="font-medium text-foreground">Health Connect</h3>
                <p className="text-xs text-muted-foreground">Sync on Android</p>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="font-medium text-foreground">Privacy First</h3>
                <p className="text-xs text-muted-foreground">100% local storage</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="mb-3 text-xl font-semibold">What is LibreArm?</h2>
                <p className="text-muted-foreground">
                  LibreArm is a free, open source application for reading blood pressure measurements 
                  from QardioArm Bluetooth blood pressure monitors. It provides a simple, privacy-focused 
                  alternative to proprietary apps, storing all your health data locally on your device.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Key Features</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    Bluetooth Low Energy connection to QardioArm monitors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    Health Connect integration for Android devices
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    Export readings to CSV or PDF formats
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    Blood pressure category classification
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    Complete reading history with local storage
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    No accounts, no cloud, no data collection
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Open Source</h2>
                <p className="mb-4 text-muted-foreground">
                  LibreArm is open source software. You can view the complete source code, report issues, 
                  or contribute to the project on GitHub.
                </p>
                <a
                  href="https://github.com/ptylr/LibreArm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Disclaimer</h2>
                <p className="text-muted-foreground">
                  LibreArm is not affiliated with, endorsed by, or connected to Qardio, Inc. 
                  QardioArm is a trademark of Qardio, Inc. This is an independent, community-developed 
                  application.
                </p>
              </section>

              <section>
                <h2 className="mb-3 text-xl font-semibold">Acknowledgments</h2>
                <p className="text-muted-foreground">
                  Built with React, Capacitor, and Web Bluetooth API. Special thanks to the open source 
                  community for the tools and libraries that make this project possible.
                </p>
              </section>

              <section className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
                <p className="text-sm text-primary">
                  Made with <Heart className="inline h-4 w-4 fill-current" /> for the health-conscious community
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}