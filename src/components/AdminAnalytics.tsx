import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Truck,
  RotateCcw,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

type OrderRow = { amount: number; status: string; created_at: string };

const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#eab308" },
  paid: { label: "Paid", color: "#22c55e" },
  processing: { label: "Processing", color: "#3b82f6" },
  shipped: { label: "Shipped", color: "#a855f7" },
  delivered: { label: "Delivered", color: "#16a34a" },
  return_requested: { label: "Return requested", color: "#f59e0b" },
  refunded: { label: "Refunded", color: "#64748b" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  failed: { label: "Failed", color: "#dc2626" },
};

const formatRs = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);

const formatShortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [productCount, setProductCount] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          supabase.from("orders").select("amount, status, created_at"),
          supabase.from("products").select("id, is_active"),
        ]);
        if (ordersRes.error) throw ordersRes.error;
        if (productsRes.error) throw productsRes.error;
        setOrders((ordersRes.data as OrderRow[]) || []);
        const products = productsRes.data || [];
        setProductCount({
          total: products.length,
          active: products.filter((p) => p.is_active).length,
        });
      } catch (e) {
        console.error("Analytics fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => PAID_STATUSES.includes(o.status));
    const revenuePaise = paid.reduce((s, o) => s + (o.amount || 0), 0);
    const now = new Date();
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentPaid = paid.filter((o) => new Date(o.created_at) >= thirtyAgo);
    const prevPaid = paid.filter((o) => {
      const d = new Date(o.created_at);
      return d >= sixtyAgo && d < thirtyAgo;
    });

    const recentRev = recentPaid.reduce((s, o) => s + o.amount, 0);
    const prevRev = prevPaid.reduce((s, o) => s + o.amount, 0);

    const recentCount = orders.filter((o) => new Date(o.created_at) >= thirtyAgo).length;
    const prevCount = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= sixtyAgo && d < thirtyAgo;
    }).length;

    return {
      totalOrders: orders.length,
      revenuePaise,
      avgOrderPaise: paid.length ? revenuePaise / paid.length : 0,
      pending: orders.filter((o) => o.status === "pending").length,
      paid: orders.filter((o) => o.status === "paid").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      returnRequested: orders.filter((o) => o.status === "return_requested").length,
      refunded: orders.filter((o) => o.status === "refunded").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      failed: orders.filter((o) => o.status === "failed").length,
      revenueGrowth: prevRev > 0 ? ((recentRev - prevRev) / prevRev) * 100 : 0,
      ordersGrowth: prevCount > 0 ? ((recentCount - prevCount) / prevCount) * 100 : 0,
      ...productCount,
    };
  }, [orders, productCount]);

  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([status, value]) => ({
        status,
        name: STATUS_META[status]?.label ?? status,
        value,
        fill: STATUS_META[status]?.color ?? "#94a3b8",
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const statusBarData = useMemo(
    () => statusPieData.map((d) => ({ name: d.name, orders: d.value, fill: d.fill })),
    [statusPieData]
  );

  const revenuePieData = useMemo(() => {
    const rev: Record<string, number> = {};
    for (const o of orders) {
      if (!PAID_STATUSES.includes(o.status) && o.status !== "refunded") continue;
      rev[o.status] = (rev[o.status] || 0) + (o.amount || 0);
    }
    return Object.entries(rev)
      .map(([status, value]) => ({
        name: STATUS_META[status]?.label ?? status,
        value: value / 100,
        fill: STATUS_META[status]?.color ?? "#94a3b8",
      }))
      .filter((d) => d.value > 0);
  }, [orders]);

  const trendData = useMemo(() => {
    const days = lastNDays(30);
    return days.map((day) => {
      const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === day);
      const paidDay = dayOrders.filter((o) => PAID_STATUSES.includes(o.status));
      return {
        date: day,
        label: formatShortDate(day),
        orders: dayOrders.length,
        revenue: paidDay.reduce((s, o) => s + o.amount, 0) / 100,
      };
    });
  }, [orders]);

  const statusChartConfig: ChartConfig = Object.fromEntries(
    Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, color: v.color }])
  );

  const trendChartConfig = {
    revenue: { label: "Revenue (₹)", color: "#EF4E23" },
    orders: { label: "Orders", color: "#3b82f6" },
  } satisfies ChartConfig;

  const GrowthBadge = ({ value }: { value: number }) => (
    <div className="flex items-center text-xs text-muted-foreground mt-1">
      {value >= 0 ? (
        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
      ) : (
        <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
      )}
      <span className={value >= 0 ? "text-green-600" : "text-red-600"}>
        {Math.abs(value).toFixed(1)}%
      </span>
      <span className="ml-1">vs prior 30 days</span>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 h-24 bg-muted/30" />
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="h-72 bg-muted/20" />
        </Card>
      </div>
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#EF4E23]" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatRs(stats.revenuePaise)}</p>
            <GrowthBadge value={stats.revenueGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              Total orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
            <GrowthBadge value={stats.ordersGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-600" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.delivered}</p>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.refunded}</p>
            <p className="text-xs text-muted-foreground">
              {stats.returnRequested} return requested
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Avg order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatRs(stats.avgOrderPaise)}</p>
            <p className="text-xs text-muted-foreground">Paid orders only</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue trend</CardTitle>
          <CardDescription>Daily revenue from paid orders (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasOrders ? (
            <p className="text-center text-muted-foreground py-16">No orders yet — chart will populate after sales.</p>
          ) : (
            <ChartContainer config={trendChartConfig} className="h-[320px] w-full">
              <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4E23" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EF4E23" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === "revenue") return [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"];
                        return [value, "Orders"];
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#EF4E23"
                  strokeWidth={2}
                  fill="url(#fillRevenue)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders trend bar */}
        <Card>
          <CardHeader>
            <CardTitle>Orders per day</CardTitle>
            <CardDescription>All orders created (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {!hasOrders ? (
              <p className="text-center text-muted-foreground py-16">No data</p>
            ) : (
              <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
                <BarChart data={trendData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>Share of all orders</CardDescription>
          </CardHeader>
          <CardContent>
            {statusPieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No orders</p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[280px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [`${value} orders`, name]}
                      />
                    }
                  />
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Order status breakdown</CardTitle>
            <CardDescription>Count by status</CardDescription>
          </CardHeader>
          <CardContent>
            {statusBarData.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No orders</p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[300px] w-full">
                <BarChart data={statusBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" radius={[0, 4, 4, 0]}>
                    {statusBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by status</CardTitle>
            <CardDescription>Paid / delivered / refunded amounts (₹)</CardDescription>
          </CardHeader>
          <CardContent>
            {revenuePieData.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">No paid revenue yet</p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Amount"]}
                      />
                    }
                  />
                  <Pie
                    data={revenuePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {revenuePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Catalog + funnel summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Store summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
            {[
              { label: "Total products", value: stats.total },
              { label: "Active products", value: stats.active },
              { label: "Paid", value: stats.paid },
              { label: "Processing", value: stats.processing },
              { label: "Shipped", value: stats.shipped },
              { label: "Delivered", value: stats.delivered },
              { label: "Cancelled", value: stats.cancelled },
              { label: "Failed", value: stats.failed },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
