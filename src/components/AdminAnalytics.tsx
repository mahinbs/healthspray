import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  recentOrdersGrowth: number;
  revenueGrowth: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    recentOrdersGrowth: 0,
    revenueGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('amount, status, created_at');

      if (ordersError) throw ordersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, is_active');

      if (productsError) throw productsError;

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0;
      const totalProducts = products?.length || 0;
      const activeProducts = products?.filter(p => p.is_active).length || 0;

      // Calculate growth (last 30 days vs previous 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentOrders = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo).length || 0;
      const previousOrders = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length || 0;

      const recentRevenue = orders?.filter(o => new Date(o.created_at) >= thirtyDaysAgo)
        .reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
      const previousRevenue = orders?.filter(o => {
        const date = new Date(o.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

      const recentOrdersGrowth = previousOrders > 0 ? 
        ((recentOrders - previousOrders) / previousOrders) * 100 : 0;
      const revenueGrowth = previousRevenue > 0 ? 
        ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      setAnalytics({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalProducts,
        activeProducts,
        recentOrdersGrowth,
        revenueGrowth,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={analytics.revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(analytics.revenueGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.recentOrdersGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              <span className={analytics.recentOrdersGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(analytics.recentOrdersGrowth).toFixed(1)}%
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {analytics.pendingOrders}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Badge variant="default" className="text-xs px-2 py-1">
              {analytics.completedOrders}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Badge variant="default" className="text-xs px-2 py-1">
              {analytics.activeProducts}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalOrders > 0 ? 
                ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Orders completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalOrders > 0 ? 
                formatCurrency(analytics.totalRevenue / analytics.totalOrders) : 
                formatCurrency(0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per order value
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;