"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useGetSalesQuery } from "@/state/api";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, Activity } from "lucide-react";

const SalesChart = () => {
  const { data: sales, isLoading } = useGetSalesQuery(undefined);
  const { theme } = useTheme();
  const [chartType, setChartType] = useState('line');
  const [timePeriod, setTimePeriod] = useState('6m'); 
  const isDarkTheme = theme === "dark";
  
  
  const generateSampleData = () => {
    const months = 12;
    const now = new Date();
    const data = [];
    
    const baseSales = 20000;
    const variance = 8000;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const month = format(date, 'MMM');
      const formattedDate = format(date, 'MMM yyyy');
      
      
      let sales = baseSales + Math.sin(i/2) * variance + Math.random() * (variance/2);
      
      
      if (month === 'Jun' || month === 'Jul' || month === 'Aug') {
        sales *= 1.2;
      }
      
      
      if (month === 'Dec') {
        sales *= 1.3;
      }
      
      const profit = sales * (0.12 + Math.random() * 0.08); 
      const units = Math.round(sales / 35000); 
      
      data.push({
        name: formattedDate,
        shortName: month,
        sales: Math.round(sales),
        profit: Math.round(profit),
        units: units
      });
    }
    return data;
  };

  
  const filterDataByPeriod = (data: any[]) => {
    if (timePeriod === 'all') return data;
    
    const periodMonths: { [key: string]: number } = {
      '1m': 1,
      '3m': 3,
      '6m': 6,
      '1y': 12
    };
    
    const months = periodMonths[timePeriod];
    return data.slice(-months);
  };

  const chartData = (sales && sales.length > 0)
    ? sales.map((sale: any) => ({
        name: new Date(sale.saleDate).toLocaleDateString(),
        shortName: format(new Date(sale.saleDate), 'MMM'),
        sales: sale.salePrice,
        profit: Math.round(sale.salePrice * 0.15), // Assuming 15% profit margin
        units: 1,
      }))
    : filterDataByPeriod(generateSampleData());
  
  
  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
  const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);
  const totalUnits = chartData.reduce((sum, item) => sum + item.units, 0);
  
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <Tabs defaultValue={chartType} onValueChange={setChartType} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="line">Line</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
            <TabsTrigger value="area">Area</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333" : "#eee"} />
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <YAxis 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                tickFormatter={(value) => `R${value/1000}k`}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkTheme ? "#333" : "#fff",
                  borderColor: isDarkTheme ? "#555" : "#ddd",
                }}
                formatter={(value: number, name: string) => {
                  return name === 'Sales' || name === 'Profit' 
                    ? [formatCurrency(value), name]
                    : [value, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333" : "#eee"} />
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <YAxis 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                tickFormatter={(value) => `R${value/1000}k`}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkTheme ? "#333" : "#fff",
                  borderColor: isDarkTheme ? "#555" : "#ddd",
                }}
                formatter={(value: number, name: string) => {
                  return name === 'Sales' || name === 'Profit' 
                    ? [formatCurrency(value), name]
                    : [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? "#333" : "#eee"} />
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <YAxis 
                tick={{ fill: isDarkTheme ? "#ccc" : "#666" }}
                tickFormatter={(value) => `R${value/1000}k`}
                axisLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
                tickLine={{ stroke: isDarkTheme ? "#555" : "#ddd" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkTheme ? "#333" : "#fff",
                  borderColor: isDarkTheme ? "#555" : "#ddd",
                }}
                formatter={(value: number, name: string) => {
                  return name === 'Sales' || name === 'Profit' 
                    ? [formatCurrency(value), name]
                    : [value, name];
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#3b82f6"
                fill="#3b82f680"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                fill="#10b98180"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="mr-4 bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
              <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center">
            <div className="mr-4 bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cars Sold</p>
              <p className="text-2xl font-bold">{totalUnits}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesChart;
