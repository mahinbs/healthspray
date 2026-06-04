import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Truck, RotateCcw } from 'lucide-react';
import { DEFAULT_SHIPPING_SETTINGS } from '@/lib/shipping';
import { DEFAULT_RETURN_POLICY } from '@/lib/returnPolicy';

const AdminStoreShippingSettings = () => {
  const [freeMinimum, setFreeMinimum] = useState(String(DEFAULT_SHIPPING_SETTINGS.free_shipping_minimum));
  const [deliveryCharge, setDeliveryCharge] = useState(String(DEFAULT_SHIPPING_SETTINGS.delivery_charge));
  const [returnWindowDays, setReturnWindowDays] = useState(String(DEFAULT_RETURN_POLICY.return_window_days));
  const [returnsEnabled, setReturnsEnabled] = useState(DEFAULT_RETURN_POLICY.returns_enabled);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('free_shipping_minimum, delivery_charge, returns_enabled, return_window_days')
          .eq('id', 'default')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFreeMinimum(String(data.free_shipping_minimum));
          setDeliveryCharge(String(data.delivery_charge));
          setReturnWindowDays(String(data.return_window_days ?? DEFAULT_RETURN_POLICY.return_window_days));
          setReturnsEnabled(data.returns_enabled !== false);
        }
      } catch (e) {
        console.error(e);
        toast.error('Could not load store settings. Run migrations in Supabase.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const min = parseFloat(freeMinimum);
    const charge = parseFloat(deliveryCharge);
    const returnDays = parseInt(returnWindowDays, 10);
    if (Number.isNaN(min) || min < 0) {
      toast.error('Enter a valid free shipping minimum (₹)');
      return;
    }
    if (Number.isNaN(charge) || charge < 0) {
      toast.error('Enter a valid delivery charge (₹)');
      return;
    }
    if (Number.isNaN(returnDays) || returnDays < 0) {
      toast.error('Enter valid return window days');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 'default',
          free_shipping_minimum: min,
          delivery_charge: charge,
          returns_enabled: returnsEnabled,
          return_window_days: returnDays,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Store settings saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save store settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery &amp; shipping
          </CardTitle>
          <CardDescription>
            Orders at or above the minimum get free delivery. Below that, the delivery charge is added at checkout.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="free-shipping-min">Free delivery from (₹)</Label>
              <Input
                id="free-shipping-min"
                type="number"
                min={0}
                step={1}
                value={freeMinimum}
                onChange={(e) => setFreeMinimum(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="delivery-charge">Delivery charge below minimum (₹)</Label>
              <Input
                id="delivery-charge"
                type="number"
                min={0}
                step={1}
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Returns &amp; refunds (customers)
          </CardTitle>
          <CardDescription>
            Universal policy for all products. Guests and logged-in users can request a return only after
            admin marks the order as <strong>Delivered</strong>. Optional per-product override: set
            <code className="mx-1 text-xs">return_window_days</code> on a product in the database (shorter window
            applies if any item in the order has a lower limit).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="returns-enabled">Allow customer return requests</Label>
              <p className="text-xs text-muted-foreground mt-1">
                When off, only admin can mark returns from the Orders tab.
              </p>
            </div>
            <Switch
              id="returns-enabled"
              checked={returnsEnabled}
              onCheckedChange={setReturnsEnabled}
            />
          </div>
          <div>
            <Label htmlFor="return-window">Return window (days after delivery)</Label>
            <Input
              id="return-window"
              type="number"
              min={0}
              step={1}
              value={returnWindowDays}
              onChange={(e) => setReturnWindowDays(e.target.value)}
              className="mt-1 max-w-xs"
              disabled={!returnsEnabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Example: 7 = customer has 7 days after delivery to request a return. Refund is still processed by
              admin after review.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Save store settings
      </Button>
    </div>
  );
};

export default AdminStoreShippingSettings;
