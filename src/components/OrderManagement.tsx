import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Eye, Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, User, RefreshCw, Download, Bell, FileText, CreditCard, RotateCcw, IndianRupee
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/services/api';
import { OrderPriceBreakdown } from '@/components/OrderPriceBreakdown';
import { getOrderBreakdown, formatRs } from '@/lib/orderBreakdown';
import { getDeliveryTimestamp, getReturnDeadline, formatDateIN } from '@/lib/returnPolicy';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';

interface AdminOrder {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  items: any[];
  delivery_address: any;
  created_at: string;
  updated_at: string;
  delivered_at?: string | null;
  payment_mode?: string;
  icici_txn_id?: string;
  icici_txn_no?: string;
  icici_payment_id?: string;
  invoice_number?: string;
  invoice_url?: string;
  invoice_generated_at?: string;
  coupon_code?: string;
  coupon_discount?: number;
  shipping_fee?: number;
  service_charge?: number;
  total_paid?: number;
  payment_sub_inst_type?: string;
  return_reason?: string;
  return_requested_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  icici_refund_ref?: string;
  refund_notes?: string;
}

const ORDER_STATUSES = [
  'pending', 'paid', 'processing', 'shipped', 'delivered',
  'return_requested', 'refunded', 'cancelled', 'failed',
] as const;

const REFUNDABLE_STATUSES = ['paid', 'processing', 'shipped', 'delivered', 'return_requested'];

const STATUS_TO_EVENT: Record<string, string> = {
  shipped: 'order_shipped',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
  return_requested: 'order_return_requested',
  refunded: 'order_refunded',
};

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(null);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { settings: storeSettings } = useStoreSettings();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data as AdminOrder[] || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      const now = new Date().toISOString();
      const patch: { status: string; updated_at: string; delivered_at?: string } = {
        status: newStatus,
        updated_at: now,
      };
      if (newStatus === 'delivered') {
        patch.delivered_at = now;
      }
      const { error } = await supabase
        .from('orders')
        .update(patch)
        .eq('id', orderId);
      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        status: newStatus,
        updated_at: now,
        ...(newStatus === 'delivered' ? { delivered_at: now } : {}),
      } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          status: newStatus,
          updated_at: now,
          ...(newStatus === 'delivered' ? { delivered_at: now } : {}),
        } : prev);
      }
      toast.success('Order status updated');

      // Auto-send notification for key status changes
      const eventType = STATUS_TO_EVENT[newStatus];
      if (eventType) {
        await sendNotification(orderId, eventType, true);
      }
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const sendNotification = async (orderId: string, eventType: string, silent = false) => {
    if (!silent) setNotifying(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('send-order-notification', {
        body: { orderId, eventType },
      });
      if (error || !data?.success) throw new Error('Notification failed');
      if (!silent) toast.success('Notification sent successfully');
    } catch {
      if (!silent) toast.error('Failed to send notification');
    } finally {
      if (!silent) setNotifying(null);
    }
  };

  const markReturnRequested = async (orderId: string, reason: string) => {
    try {
      setUpdating(orderId);
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'return_requested',
          return_reason: reason || 'Customer return',
          return_requested_at: now,
          updated_at: now,
        })
        .eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'return_requested', return_reason: reason } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'return_requested', return_reason: reason } : prev);
      }
      toast.success('Marked as return requested');
      await sendNotification(orderId, 'order_return_requested', true);
    } catch {
      toast.error('Failed to update return status');
    } finally {
      setUpdating(null);
    }
  };

  const processRefund = async (orderId: string, manual = false) => {
    setProcessingRefund(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('icici-process-refund', {
        body: {
          orderId,
          reason: returnReason || selectedOrder?.return_reason,
          manual,
        },
      });
      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Refund failed');
      }
      toast.success(
        manual
          ? 'Refund recorded in admin. Complete payout in ICICI merchant portal if needed.'
          : `Refund processed${data.iciciRefundRef ? ` (ref: ${data.iciciRefundRef})` : ''}`
      );
      setReturnReason('');
      await fetchOrders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Refund failed');
    } finally {
      setProcessingRefund(null);
    }
  };

  const generateInvoice = async (orderId: string) => {
    setGeneratingInvoice(orderId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { orderId },
      });
      if (error || !data?.success) throw new Error('Generation failed');
      toast.success(`Invoice generated: ${data.invoiceNumber}`);
      await fetchOrders();
    } catch {
      toast.error('Failed to generate invoice');
    } finally {
      setGeneratingInvoice(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      paid: <CheckCircle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      processing: <Package className="h-3 w-3 mr-1" />,
      shipped: <Truck className="h-3 w-3 mr-1" />,
      delivered: <CheckCircle className="h-3 w-3 mr-1" />,
      cancelled: <XCircle className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
      return_requested: <RotateCcw className="h-3 w-3 mr-1" />,
      refunded: <IndianRupee className="h-3 w-3 mr-1" />,
    };
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      return_requested: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      refunded: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    };
    return (
      <Badge className={colors[status] ?? ''}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(o => statusFilter === 'all' || o.status === statusFilter);

  const stats = {
    total: orders.length,
    paid: orders.filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    returns: orders.filter(o => ['return_requested', 'refunded'].includes(o.status)).length,
    revenue: orders
      .filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: <Package className="h-5 w-5 text-blue-500" /> },
          { label: 'Paid Orders', value: stats.paid, icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { label: 'Pending', value: stats.pending, icon: <Clock className="h-5 w-5 text-yellow-500" /> },
          { label: 'Delivered', value: stats.delivered, icon: <Truck className="h-5 w-5 text-purple-500" /> },
          { label: 'Returns/Refunds', value: stats.returns, icon: <RotateCcw className="h-5 w-5 text-amber-500" /> },
          { label: 'Revenue', value: formatPrice(stats.revenue / 100), icon: <CreditCard className="h-5 w-5 text-emerald-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {['all', ...ORDER_STATUSES].map(s => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">#{order.id.slice(-8)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.delivery_address?.fullName || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{order.delivery_address?.phone || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <div>{formatRs(getOrderBreakdown(order).customerPaidRupees)}</div>
                      {getOrderBreakdown(order).hasServiceCharge && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Merchant {formatRs(getOrderBreakdown(order).merchantTotalRupees)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.payment_mode || '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.invoice_url ? (
                        <Button size="sm" variant="ghost" onClick={() => window.open(order.invoice_url!, '_blank')}>
                          <Download className="h-3 w-3 mr-1" />
                          {order.invoice_number || 'PDF'}
                        </Button>
                      ) : order.status === 'paid' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={generatingInvoice === order.id}
                          onClick={() => generateInvoice(order.id)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {generatingInvoice === order.id ? 'Generating...' : 'Generate'}
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Details Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                            </DialogHeader>

                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Two-column info */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Order Info</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Placed:</span> {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
                                      {(() => {
                                        const deliveredAt = getDeliveryTimestamp(selectedOrder);
                                        if (!deliveredAt) return null;
                                        const windowDays = storeSettings.return_window_days ?? 7;
                                        const returnUntil = storeSettings.returns_enabled
                                          ? getReturnDeadline(deliveredAt, windowDays)
                                          : null;
                                        return (
                                          <>
                                            <p>
                                              <span className="font-medium">Delivered on:</span>{' '}
                                              <span className="text-green-700 dark:text-green-400">
                                                {deliveredAt.toLocaleString('en-IN')}
                                              </span>
                                              {!selectedOrder.delivered_at && (
                                                <span className="text-muted-foreground text-xs ml-1">(from status update)</span>
                                              )}
                                            </p>
                                            {returnUntil && (
                                              <p className="text-muted-foreground text-xs">
                                                Return window ends {formatDateIN(returnUntil)} ({windowDays} days)
                                              </p>
                                            )}
                                          </>
                                        );
                                      })()}
                                      <p><span className="font-medium">Amount:</span> {formatPrice(selectedOrder.amount / 100)}</p>
                                      <p><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
                                      {selectedOrder.payment_mode && <p><span className="font-medium">Payment Mode:</span> {selectedOrder.payment_mode}</p>}
                                      {selectedOrder.icici_txn_id && <p className="font-mono text-xs"><span className="font-semibold not-italic">Txn ID:</span> {selectedOrder.icici_txn_id}</p>}
                                      {selectedOrder.icici_payment_id && <p className="font-mono text-xs"><span className="font-semibold not-italic">Payment ID:</span> {selectedOrder.icici_payment_id}</p>}
                                      {selectedOrder.invoice_number && <p><span className="font-medium">Invoice:</span> {selectedOrder.invoice_number}</p>}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Delivery</h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="flex items-center gap-1"><User className="h-3 w-3" />{selectedOrder.delivery_address?.fullName}</p>
                                      <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedOrder.delivery_address?.phone}</p>
                                      <p className="flex items-start gap-1">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span>{selectedOrder.delivery_address?.address}, {selectedOrder.delivery_address?.city}, {selectedOrder.delivery_address?.state} - {selectedOrder.delivery_address?.pincode}</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-muted/30 rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">Payment breakdown</h4>
                                  <OrderPriceBreakdown order={selectedOrder} status={selectedOrder.status} admin />
                                </div>

                                {/* Items */}
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm uppercase text-muted-foreground">Items</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, index: number) => (
                                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <img
                                          src={item.product?.image || '/placeholder.svg'}
                                          alt={item.product?.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{item.product?.name}</p>
                                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm">{formatPrice((item.product?.price || 0) * item.quantity)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Admin Actions */}
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                  {/* Status Update */}
                                  <div>
                                    <h4 className="font-semibold mb-2 text-sm">Update Status</h4>
                                    <Select
                                      value={selectedOrder.status}
                                      onValueChange={(v) => updateOrderStatus(selectedOrder.id, v)}
                                      disabled={updating === selectedOrder.id}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ORDER_STATUSES.map(s => (
                                          <SelectItem key={s} value={s}>
                                            {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Manual Notifications */}
                                  <div>
                                    <h4 className="font-semibold mb-2 text-sm">Send Notification</h4>
                                    <div className="flex flex-col gap-2">
                                      {Object.entries({
                                        payment_confirmed: 'Payment Confirmed',
                                        order_shipped: 'Shipped',
                                        order_delivered: 'Delivered',
                                        order_cancelled: 'Cancelled',
                                      }).map(([event, label]) => (
                                        <Button
                                          key={event}
                                          size="sm"
                                          variant="outline"
                                          disabled={notifying === selectedOrder.id}
                                          onClick={() => sendNotification(selectedOrder.id, event)}
                                        >
                                          <Bell className="h-3 w-3 mr-1" />
                                          {label}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Return & refund (ICICI) */}
                                {REFUNDABLE_STATUSES.includes(selectedOrder.status) && (
                                  <div className="space-y-3 pt-2 border-t">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                      <RotateCcw className="h-4 w-4" />
                                      Return &amp; Refund
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                      Mark return when customer sends product back. Process refund here after ICICI payment (or record manual refund from merchant portal).
                                    </p>
                                    <div>
                                      <Label htmlFor="return-reason" className="text-xs">Return reason</Label>
                                      <Textarea
                                        id="return-reason"
                                        className="mt-1 min-h-[60px]"
                                        placeholder="e.g. Damaged product, wrong size..."
                                        value={returnReason || selectedOrder.return_reason || ''}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedOrder.status !== 'return_requested' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={updating === selectedOrder.id}
                                          onClick={() => markReturnRequested(selectedOrder.id, returnReason)}
                                        >
                                          <RotateCcw className="h-3 w-3 mr-1" />
                                          Mark return requested
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="default"
                                        disabled={processingRefund === selectedOrder.id}
                                        onClick={() => processRefund(selectedOrder.id, false)}
                                      >
                                        <IndianRupee className="h-3 w-3 mr-1" />
                                        {processingRefund === selectedOrder.id ? 'Processing...' : 'Refund via ICICI'}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={processingRefund === selectedOrder.id}
                                        onClick={() => processRefund(selectedOrder.id, true)}
                                      >
                                        Record manual refund
                                      </Button>
                                    </div>
                                    {selectedOrder.icici_txn_no && (
                                      <p className="text-xs font-mono text-muted-foreground">
                                        ICICI Txn: {selectedOrder.icici_txn_no}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {selectedOrder.status === 'refunded' && (
                                  <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                                    <p><strong>Refunded</strong> {selectedOrder.refunded_at && new Date(selectedOrder.refunded_at).toLocaleString()}</p>
                                    {selectedOrder.return_reason && <p>Reason: {selectedOrder.return_reason}</p>}
                                    {selectedOrder.icici_refund_ref && <p className="font-mono text-xs">Ref: {selectedOrder.icici_refund_ref}</p>}
                                    {selectedOrder.refund_notes && <p className="text-xs">{selectedOrder.refund_notes}</p>}
                                  </div>
                                )}

                                {/* Invoice actions */}
                                <div className="flex gap-3 pt-2 border-t">
                                  {selectedOrder.invoice_url ? (
                                    <Button onClick={() => window.open(selectedOrder.invoice_url!, '_blank')} variant="outline">
                                      <Download className="h-4 w-4 mr-2" />Download Invoice
                                    </Button>
                                  ) : null}
                                  {selectedOrder.status === 'paid' && (
                                    <Button
                                      variant="outline"
                                      disabled={generatingInvoice === selectedOrder.id}
                                      onClick={() => generateInvoice(selectedOrder.id)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {selectedOrder.invoice_url ? 'Regenerate Invoice' : 'Generate Invoice'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Quick status update */}
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateOrderStatus(order.id, v)}
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(s => (
                              <SelectItem key={s} value={s}>
                                {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Quick notify button */}
                        {STATUS_TO_EVENT[order.status] && (
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Send status notification"
                            disabled={notifying === order.id}
                            onClick={() => sendNotification(order.id, STATUS_TO_EVENT[order.status])}
                          >
                            <Bell className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;
