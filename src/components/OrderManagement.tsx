import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Package, Truck, CheckCircle, Clock, XCircle, Calendar, MapPin, Phone, User, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/services/api';
import { toast } from 'sonner';

interface AdminOrder {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  items: any[];
  delivery_address: any;
  created_at: string;
  updated_at: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data as AdminOrder[] || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          <Package className="h-3 w-3 mr-1" />
          Processing
        </Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
          <Truck className="h-3 w-3 mr-1" />
          Shipped
        </Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Delivered
        </Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const getOrderStats = () => {
    const total = orders.length;
    const paid = orders.filter(o => o.status === 'paid' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    
    return { total, paid, pending, delivered };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Orders</p>
                <p className="text-xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={fetchOrders} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'all' ? 'No orders have been placed yet.' : `No ${statusFilter} orders found.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.delivery_address?.fullName || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_address?.phone || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(order.amount / 100)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - #{order.id.slice(-8)}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Order Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="font-medium">Order ID:</span> #{selectedOrder.id.slice(-8)}</p>
                                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                      <p><span className="font-medium">Payment ID:</span> {selectedOrder.razorpay_payment_id || 'N/A'}</p>
                                      <p><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.status)}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Delivery Address</h4>
                                    <div className="space-y-1 text-sm">
                                      <p className="flex items-center">
                                        <User className="h-3 w-3 mr-1" />
                                        {selectedOrder.delivery_address?.fullName}
                                      </p>
                                      <p className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {selectedOrder.delivery_address?.phone}
                                      </p>
                                      <p className="flex items-start">
                                        <MapPin className="h-3 w-3 mr-1 mt-0.5" />
                                        <span>
                                          {selectedOrder.delivery_address?.address}<br />
                                          {selectedOrder.delivery_address?.city}, {selectedOrder.delivery_address?.state} - {selectedOrder.delivery_address?.pincode}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h4 className="font-semibold mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, index: number) => (
                                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                                        <img 
                                          src={item.product?.image || '/placeholder.svg'} 
                                          alt={item.product?.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium">{item.product?.name}</p>
                                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">
                                          {formatPrice((item.product?.price || 0) * item.quantity)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Status Update */}
                                <div>
                                  <h4 className="font-semibold mb-2">Update Status</h4>
                                  <Select 
                                    value={selectedOrder.status} 
                                    onValueChange={(newStatus) => updateOrderStatus(selectedOrder.id, newStatus)}
                                    disabled={updating === selectedOrder.id}
                                  >
                                    <SelectTrigger className="w-48">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="processing">Processing</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                      <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select 
                          value={order.status} 
                          onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
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