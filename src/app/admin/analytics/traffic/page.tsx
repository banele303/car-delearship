"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Globe, 
  ExternalLink, 
  MousePointer2, 
  Users, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function TrafficAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const router = useRouter();

  // Simulated Traffic Data (until API is connected)
  const trafficData = useMemo(() => [
    { name: 'Feb 20', views: 420 },
    { name: 'Feb 21', views: 550 },
    { name: 'Feb 22', views: 480 },
    { name: 'Feb 23', views: 610 },
    { name: 'Feb 24', views: 890 },
    { name: 'Feb 25', views: 760 },
    { name: 'Feb 26', views: 950 },
  ], []);

  const sourceData = useMemo(() => [
    { name: 'Direct', value: 45 },
    { name: 'Google Search', value: 30 },
    { name: 'Social Media', value: 15 },
    { name: 'Referrals', value: 10 },
  ], []);

  const deviceData = useMemo(() => [
    { name: 'Desktop', value: 65, icon: Monitor },
    { name: 'Mobile', value: 28, icon: Smartphone },
    { name: 'Tablet', value: 7, icon: Tablet },
  ], []);

  const topPages = [
    { path: '/', views: '12,450', bounce: '24%' },
    { path: '/inventory', views: '8,210', bounce: '31%' },
    { path: '/financing', views: '3,450', bounce: '12%' },
    { path: '/blog', views: '2,100', bounce: '45%' },
    { path: '/contact', views: '1,200', bounce: '18%' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Web Traffic Insights</h1>
          <p className="text-slate-500 dark:text-slate-400">Deep dive into your visitor behavior and acquisition channels.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all font-semibold"
            onClick={() => window.open('https://us.posthog.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open PostHog
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 dark:border-slate-800"
            onClick={() => router.push('/admin/analytics')}
          >
            Business Analytics
          </Button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Visitors" 
          value="4,892" 
          trend="+12.5%" 
          trendUp={true} 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Avg. Session" 
          value="3m 42s" 
          trend="+5.2%" 
          trendUp={true} 
          icon={Clock} 
          color="emerald"
        />
        <StatCard 
          title="Unique Clicks" 
          value="1,240" 
          trend="-2.1%" 
          trendUp={false} 
          icon={MousePointer2} 
          color="amber"
        />
        <StatCard 
          title="Active Now" 
          value="14" 
          description="Users online" 
          icon={Globe} 
          color="purple"
          pulse={true}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Traffic Chart */}
        <Card className="lg:col-span-2 p-6 rounded-3xl border-none shadow-sm dark:bg-slate-900 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor Traffic</h3>
              <p className="text-sm text-slate-500">Daily unique visitors across all pages</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3 mr-1" />
                Live
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#1e293b',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Acquisition Pie */}
        <Card className="p-6 rounded-3xl border-none shadow-sm dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Discovery Source</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400">Direct</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">45%</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {sourceData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Breakdown */}
        <Card className="p-6 rounded-3xl border-none shadow-sm dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Device Distribution</h3>
          <div className="space-y-6">
            {deviceData.map((device, i) => (
              <div key={device.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <device.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold">{device.name}</span>
                  </div>
                  <span className="text-sm font-bold">{device.value}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${device.value}%`, 
                      backgroundColor: COLORS[i] 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Pages Table */}
        <Card className="p-6 rounded-3xl border-none shadow-sm dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Most Visited Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 font-bold">Page Path</th>
                  <th className="pb-3 font-bold text-right">Views</th>
                  <th className="pb-3 font-bold text-right">Bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topPages.map((page) => (
                  <tr key={page.path} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 underline decoration-blue-500/20 underline-offset-4 cursor-pointer">
                        {page.path}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm font-bold">{page.views}</td>
                    <td className="py-3 text-right">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-lg",
                        parseInt(page.bounce) > 30 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      )}>
                        {page.bounce}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp, description, icon: Icon, color, pulse = false }: any) {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <Card className="p-6 rounded-3xl border-none shadow-sm dark:bg-slate-900 hover:shadow-md transition-all group overflow-hidden relative">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white capitalize">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-bold flex items-center px-1.5 py-0.5 rounded-md",
                trendUp ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"
              )}>
                {trendUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {trend}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium italic">{description || "Last 30 days"}</p>
        </div>
        <div className={cn("p-4 rounded-2xl relative", colors[color as keyof typeof colors])}>
          {pulse && (
            <span className="absolute inset-0 rounded-2xl bg-current opacity-20 animate-ping" />
          )}
          <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </Card>
  );
}
