// PWA Install Prompt Handler
export class InstallPromptManager {
  private deferredPrompt: any = null;
  private installShown = false;
  private startTime = Date.now();
  private readonly ENGAGEMENT_TIME = 3 * 60 * 1000; // 3 minutes in production
  private readonly STORAGE_KEY = 'streemr-install-prompt-dismissed';

  constructor() {
    console.log('📱 PWA InstallPromptManager initialized');
    this.setupInstallPrompt();
    this.checkEngagementTime();
  }

  private setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt available');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      this.deferredPrompt = e;
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was installed');
      this.deferredPrompt = null;
      localStorage.setItem(this.STORAGE_KEY, 'installed');
    });
  }

  private checkEngagementTime() {
    // Check every 30 seconds in production
    const checkInterval = setInterval(() => {
      const timeSpent = Date.now() - this.startTime;
      console.log(`⏱️ Time spent: ${Math.round(timeSpent/1000)}s / ${this.ENGAGEMENT_TIME/1000}s`);
      
      if (timeSpent >= this.ENGAGEMENT_TIME) {
        console.log('⏰ Engagement time reached, checking install prompt...');
        clearInterval(checkInterval);
        this.maybeShowInstallPrompt();
      }
    }, 30000); // Check every 30 seconds
  }

  private maybeShowInstallPrompt() {
    console.log('🔍 Checking install prompt conditions...');
    console.log('  - Already shown:', this.installShown);
    console.log('  - Previously dismissed:', this.wasPromptDismissed());
    console.log('  - Already installed:', this.isInstalled());
    console.log('  - Browser support (deferredPrompt):', !!this.deferredPrompt);
    
    // Don't show if already shown, dismissed, or installed
    if (this.installShown || this.wasPromptDismissed() || this.isInstalled()) {
      console.log('❌ Install prompt blocked: already shown/dismissed/installed');
      return;
    }

    // Don't show if browser doesn't support PWA installation
    if (!this.deferredPrompt) {
      console.log('❌ Install prompt blocked: browser does not support PWA installation');
      return;
    }

    console.log('✅ Showing install prompt!');
    this.showCustomInstallPrompt();
  }

  private showCustomInstallPrompt() {
    this.installShown = true;
    
    // Create and dispatch custom event
    const installEvent = new CustomEvent('showInstallPrompt', {
      detail: {
        install: this.installApp.bind(this),
        dismiss: this.dismissPrompt.bind(this)
      }
    });
    
    window.dispatchEvent(installEvent);
  }

  private async installApp() {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`👤 User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        localStorage.setItem(this.STORAGE_KEY, 'installed');
      } else {
        console.log('❌ User dismissed the install prompt');
        localStorage.setItem(this.STORAGE_KEY, 'dismissed');
      }
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('❌ Error showing install prompt:', error);
      return false;
    }
  }

  private dismissPrompt() {
    localStorage.setItem(this.STORAGE_KEY, 'dismissed');
    console.log('🚫 Install prompt dismissed by user');
  }

  private wasPromptDismissed(): boolean {
    const status = localStorage.getItem(this.STORAGE_KEY);
    return status === 'dismissed' || status === 'installed';
  }

  private isInstalled(): boolean {
    // Check if running in standalone mode (installed PWA)
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           localStorage.getItem(this.STORAGE_KEY) === 'installed';
  }

  // Public method to manually trigger install prompt
  public triggerInstallPrompt() {
    if (this.deferredPrompt && !this.wasPromptDismissed()) {
      this.showCustomInstallPrompt();
    }
  }

  // Force show prompt for testing (bypasses browser support check)
  public forceShowPrompt() {
    console.log('🧪 Force showing install prompt for testing...');
    this.showCustomInstallPrompt();
  }

  // Public method to check if install is available
  public isInstallAvailable(): boolean {
    return !!this.deferredPrompt && !this.wasPromptDismissed() && !this.isInstalled();
  }
}

// Export singleton instance
export const installPromptManager = new InstallPromptManager();