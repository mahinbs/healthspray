import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Coupon = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_discount: number | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  usage_limit_per_user: number;
  total_usage: number;
  total_usage_limit: number | null;
  description: string | null;
  min_cart_value: number | null;
};

const CouponsManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [usagePerUser, setUsagePerUser] = useState('1');
  const [totalLimit, setTotalLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [minCartValue, setMinCartValue] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setCoupons((data as Coupon[]) || []);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setCode('');
    setType('percentage');
    setValue('10');
    setMaxDiscount('');
    setStartsAt('');
    setEndsAt('');
    setUsagePerUser('1');
    setTotalLimit('');
    setIsActive(true);
    setDescription('');
    setMinCartValue('');
    setEditingCoupon(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMaxDiscount(coupon.max_discount?.toString() || '');
    setStartsAt(new Date(coupon.starts_at).toISOString().slice(0, 16));
    setEndsAt(new Date(coupon.ends_at).toISOString().slice(0, 16));
    setUsagePerUser(coupon.usage_limit_per_user.toString());
    setTotalLimit(coupon.total_usage_limit?.toString() || '');
    setIsActive(coupon.is_active);
    setDescription(coupon.description || '');
    setMinCartValue(coupon.min_cart_value?.toString() || '');
    setIsDialogOpen(true);
  };

  const saveCoupon = async () => {
    try {
      setLoading(true);
      if (!code || !startsAt || !endsAt) {
        toast.error('Code, start and end date are required');
        return;
      }
      
      const couponData = {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        max_discount: maxDiscount ? Number(maxDiscount) : null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        usage_limit_per_user: Number(usagePerUser) || 1,
        total_usage_limit: totalLimit ? Number(totalLimit) : null,
        is_active: isActive,
        description: description.trim() || null,
        min_cart_value: minCartValue ? Number(minCartValue) : null,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);
        if (error) throw error;
        toast.success('Coupon updated');
      } else {
        const { error } = await supabase.from('coupons').insert(couponData);
        if (error) throw error;
        toast.success('Coupon created');
      }
      
      setIsDialogOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      toast.success('Coupon deleted');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Coupons</h2>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Existing Coupons</h3>
        {coupons.length === 0 ? (
          <p className="text-muted-foreground text-sm">No coupons yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{c.code}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}
                      {c.max_discount && ` (max ₹${c.max_discount})`}
                    </div>
                    {c.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {c.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteCoupon(c.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Valid: {new Date(c.starts_at).toLocaleDateString()} - {new Date(c.ends_at).toLocaleDateString()}</div>
                  <div>Per user: {c.usage_limit_per_user} | Total: {c.total_usage}/{c.total_usage_limit ?? '∞'}</div>
                  {c.min_cart_value && (
                    <div>Min cart: ₹{c.min_cart_value}</div>
                  )}
                  <div className={`font-medium ${c.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  placeholder="SAVE10"
                  disabled={!!editingCoupon}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input 
                  type="number" 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)} 
                  placeholder="10" 
                />
              </div>
              <div className="space-y-2">
                <Label>Max Discount (optional, for %)</Label>
                <Input 
                  type="number" 
                  value={maxDiscount} 
                  onChange={(e) => setMaxDiscount(e.target.value)} 
                  placeholder="200" 
                />
              </div>
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input 
                  type="datetime-local" 
                  value={startsAt} 
                  onChange={(e) => setStartsAt(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input 
                  type="datetime-local" 
                  value={endsAt} 
                  onChange={(e) => setEndsAt(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Usage per user</Label>
                <Input 
                  type="number" 
                  value={usagePerUser} 
                  onChange={(e) => setUsagePerUser(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Total usage limit (blank = infinite)</Label>
                <Input 
                  type="number" 
                  value={totalLimit} 
                  onChange={(e) => setTotalLimit(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum cart value (optional)</Label>
                <Input 
                  type="number" 
                  value={minCartValue} 
                  onChange={(e) => setMinCartValue(e.target.value)} 
                  placeholder="e.g., 500 (minimum cart value)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g., Get 10% off on all sports supplements"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active">Active Coupon</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCoupon} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                editingCoupon ? 'Update Coupon' : 'Create Coupon'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManager;


