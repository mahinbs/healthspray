import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Truck } from 'lucide-react';
import { DEFAULT_SHIPPING_SETTINGS } from '@/lib/shipping';

const AdminStoreShippingSettings = () => {
  const [freeMinimum, setFreeMinimum] = useState(String(DEFAULT_SHIPPING_SETTINGS.free_shipping_minimum));
  const [deliveryCharge, setDeliveryCharge] = useState(String(DEFAULT_SHIPPING_SETTINGS.delivery_charge));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('free_shipping_minimum, delivery_charge')
          .eq('id', 'default')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFreeMinimum(String(data.free_shipping_minimum));
          setDeliveryCharge(String(data.delivery_charge));
        }
      } catch (e) {
        console.error(e);
        toast.error('Could not load shipping settings. Run the store_settings migration in Supabase.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const min = parseFloat(freeMinimum);
    const charge = parseFloat(deliveryCharge);
    if (Number.isNaN(min) || min < 0) {
      toast.error('Enter a valid free shipping minimum (₹)');
      return;
    }
    if (Number.isNaN(charge) || charge < 0) {
      toast.error('Enter a valid delivery charge (₹)');
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
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Shipping settings saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save. Ensure store_settings table exists in Supabase.');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery & shipping
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
            <p className="text-xs text-muted-foreground mt-1">
              Example: 500 means cart ₹500+ ships free.
            </p>
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
            <p className="text-xs text-muted-foreground mt-1">
              Applied when order total is under the minimum.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save shipping rules
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminStoreShippingSettings;
