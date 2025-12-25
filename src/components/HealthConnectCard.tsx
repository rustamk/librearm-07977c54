import { motion } from 'framer-motion';
import { Heart, ExternalLink, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useHealthConnect } from '@/hooks/useHealthConnect';

export function HealthConnectCard() {
  const {
    status,
    isAvailable,
    isAndroidPlatform,
    hasPermissions,
    syncEnabled,
    isSyncing,
    syncError,
    requestPermissions,
    openSettings,
    toggleSync,
  } = useHealthConnect();

  // Don't show on non-Android platforms
  if (!isAndroidPlatform) {
    return null;
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'available':
        if (hasPermissions && syncEnabled) {
          return {
            icon: <CheckCircle2 className="h-4 w-4 text-success" />,
            text: 'Syncing to Health Connect',
            color: 'text-success',
          };
        }
        if (hasPermissions) {
          return {
            icon: <Heart className="h-4 w-4 text-muted-foreground" />,
            text: 'Health Connect ready',
            color: 'text-muted-foreground',
          };
        }
        return {
          icon: <Heart className="h-4 w-4 text-primary" />,
          text: 'Health Connect available',
          color: 'text-primary',
        };
      case 'not_installed':
        return {
          icon: <XCircle className="h-4 w-4 text-warning" />,
          text: 'Health Connect not installed',
          color: 'text-warning',
        };
      case 'not_supported':
        return {
          icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
          text: 'Health Connect not supported',
          color: 'text-muted-foreground',
        };
      default:
        return {
          icon: <Heart className="h-4 w-4 text-muted-foreground" />,
          text: 'Checking Health Connect...',
          color: 'text-muted-foreground',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card p-4 shadow-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            {isSyncing ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Heart className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Health Connect</h3>
            <div className={`flex items-center gap-1.5 text-xs ${statusInfo.color}`}>
              {statusInfo.icon}
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {isAvailable && hasPermissions && (
          <Switch
            checked={syncEnabled}
            onCheckedChange={toggleSync}
            aria-label="Toggle Health Connect sync"
          />
        )}
      </div>

      {/* Error message */}
      {syncError && (
        <p className="mt-2 text-xs text-destructive">{syncError}</p>
      )}

      {/* Setup prompt for available but no permissions */}
      {isAvailable && !hasPermissions && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Sync blood pressure readings to Samsung Health or Google Fit
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={requestPermissions}
            className="w-full"
          >
            Enable Sync
          </Button>
        </div>
      )}

      {/* Install prompt for not installed */}
      {status === 'not_installed' && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            Install Health Connect to sync readings to Samsung Health or Google Fit
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={openSettings}
            className="w-full gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Get Health Connect
          </Button>
        </div>
      )}

      {/* Settings link for enabled users */}
      {isAvailable && hasPermissions && syncEnabled && (
        <button
          onClick={openSettings}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Manage in Health Connect</span>
        </button>
      )}
    </motion.div>
  );
}
