import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Globe, Monitor, Smartphone } from 'lucide-react';

interface PopupGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const PopupGuide: React.FC<PopupGuideProps> = ({ isOpen, onClose, onRetry }) => {
  const getBrowserType = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    return 'other';
  };

  const browserType = getBrowserType();

  const getBrowserInstructions = () => {
    switch (browserType) {
      case 'chrome':
        return {
          icon: Monitor,
          steps: [
            'Look for a popup blocked icon in the address bar (usually on the right)',
            'Click on the popup blocked icon',
            'Select "Always allow popups from this site"',
            'Click "Done" and try payment again'
          ]
        };
      case 'firefox':
        return {
          icon: Globe,
          steps: [
            'Look for a popup blocked notification in the address bar',
            'Click "Options" next to the blocked popup message',
            'Select "Allow popups for this site"',
            'Try payment again'
          ]
        };
      case 'safari':
        return {
          icon: Smartphone,
          steps: [
            'Go to Safari > Preferences > Websites',
            'Select "Pop-up Windows" from the left sidebar',
            'Set this website to "Allow"',
            'Try payment again'
          ]
        };
      default:
        return {
          icon: AlertCircle,
          steps: [
            'Look for a popup blocked icon or notification',
            'Allow popups for this website',
            'Refresh the page if needed',
            'Try payment again'
          ]
        };
    }
  };

  const instructions = getBrowserInstructions();
  const IconComponent = instructions.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Popup Blocked
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {browserType === 'chrome' && 'Chrome Browser'}
                {browserType === 'firefox' && 'Firefox Browser'}
                {browserType === 'safari' && 'Safari Browser'}
                {browserType === 'other' && 'Browser Settings'}
              </span>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              Your browser blocked the payment window. Please follow these steps:
            </p>
            
            <ol className="text-sm text-orange-700 space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-orange-200 text-orange-800 rounded-full text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Why do we need popups?</h4>
            <p className="text-sm text-blue-700">
              We open payments in a separate window for security. This keeps your payment information 
              safe and allows you to complete the transaction without losing your shopping cart.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onRetry} className="flex-1">
              Try Payment Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
