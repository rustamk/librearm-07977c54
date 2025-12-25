import { motion } from 'framer-motion';
import { Github, Shield, ExternalLink, FileText, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-auto border-t border-border bg-muted/30 px-4 py-6"
    >
      <div className="mx-auto max-w-md space-y-4">
        {/* Privacy Notice */}
        <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-success">100% Private.</span> All data stays on your device. 
            No accounts, no cloud, no data leaves your phone.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/privacy"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Privacy
          </Link>
          <Link
            to="/terms"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Scale className="h-4 w-4" />
            Terms
          </Link>
          <a
            href="https://github.com/ptylr/LibreArm"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            Source
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground/70">
          LibreArm is not affiliated with Qardio, Inc.
          <br />
          Based on the original iOS app by{' '}
          <a 
            href="https://ptylr.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-muted-foreground"
          >
            Paul Taylor
          </a>
        </p>
      </div>
    </motion.footer>
  );
}