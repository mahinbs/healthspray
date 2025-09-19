import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck } from 'lucide-react';

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTotal: number;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderTotal 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Order Placed Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your order has been placed and payment confirmed.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold">Order ID: #{orderId.slice(-8)}</p>
              <p className="text-lg font-bold text-primary">₹{orderTotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>Processing</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              <span>Shipping</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will receive an order confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Expected delivery: 3-5 business days
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Continue Shopping
            </Button>
            <Button 
              onClick={() => window.location.href = '/orders'} 
              className="flex-1"
            >
              Track Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};