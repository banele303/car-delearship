"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAuthUserQuery } from "@/state/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, Home, Banknote, MapPin } from "lucide-react";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month");
  const { data: authUser } = useGetAuthUserQuery();
  const router = useRouter();

  
  const carData = [
    { name: 'Sedan', count: 75 },
    { name: 'SUV', count: 50 },
    { name: 'Truck', count: 30 },
    { name: 'Hatchback', count: 40 },
    { name: 'Coupe', count: 20 },
  ];

  const cityData = [
    { name: 'Johannesburg', count: 80 },
    { name: 'Cape Town', count: 60 },
    { name: 'Durban', count: 45 },
    { name: 'Pretoria', count: 35 },
    { name: 'Port Elizabeth', count: 25 },
    { name: 'Other', count: 10 },
  ];

  const priceRangeData = [
    { name: 'R0-R100k', count: 20 },
    { name: 'R100k-R200k', count: 50 },
    { name: 'R200k-R300k', count: 60 },
    { name: 'R300k-R400k', count: 40 },
    { name: 'R400k-R500k', count: 25 },
    { name: 'R500k+', count: 15 },
  ];

  const employeeActivityData = [
    { name: 'John Doe', sales: 15, inquiries: 40, testDrives: 10 },
    { name: 'Jane Smith', sales: 12, inquiries: 35, testDrives: 8 },
    { name: 'Peter Jones', sales: 10, inquiries: 30, testDrives: 7 },
    { name: 'Sarah Brown', sales: 8, inquiries: 25, testDrives: 6 },
    { name: 'David Green', sales: 7, inquiries: 20, testDrives: 5 },
  ];

  const customerActivityData = [
    { month: 'Jan', inquiries: 50, testDrives: 20, purchases: 10 },
    { month: 'Feb', inquiries: 55, testDrives: 22, purchases: 12 },
    { month: 'Mar', inquiries: 60, testDrives: 25, purchases: 15 },
    { month: 'Apr', inquiries: 65, testDrives: 28, purchases: 18 },
    { month: 'May', inquiries: 70, testDrives: 30, purchases: 20 },
  ];

  

  
  const totalCars = carData.reduce((sum, item) => sum + item.count, 0);
  const totalEmployees = 25; 
  const totalCustomers = 500; 
  const totalSales = 150; 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cars</p>
              <h3 className="text-2xl font-bold">{totalCars}</h3>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
              <h3 className="text-2xl font-bold">{totalEmployees}</h3>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
              <h3 className="text-2xl font-bold">{totalCustomers}</h3>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</p>
              <h3 className="text-2xl font-bold">{totalSales}</h3>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <Banknote className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cars">Car Analytics</TabsTrigger>
          <TabsTrigger value="employees">Employee Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>
        
        
        <TabsContent value="cars" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Car Types</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={carData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={(entry) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {carData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Car Locations</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Cars" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Price Ranges</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priceRangeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Cars" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Car Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Available', value: 85 },
                        { name: 'Sold', value: 110 },
                        { name: 'Under Maintenance', value: 15 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#82ca9d" />
                      <Cell fill="#8884d8" />
                      <Cell fill="#ffc658" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        
        <TabsContent value="employees" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Employees by Sales</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeActivityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Employees by Inquiries</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeActivityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inquiries" fill="#82ca9d" name="Inquiries" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Top Employees by Test Drives</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={employeeActivityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="testDrives" fill="#ffc658" name="Test Drives" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Employee Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: 20 },
                        { name: 'Inactive', value: 3 },
                        { name: 'Suspended', value: 2 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#82ca9d" />
                      <Cell fill="#ffc658" />
                      <Cell fill="#8884d8" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
        
        
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            <Card className="p-4 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Customer Activity Over Time</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={customerActivityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inquiries" fill="#8884d8" name="Inquiries" />
                    <Bar dataKey="testDrives" fill="#82ca9d" name="Test Drives" />
                    <Bar dataKey="purchases" fill="#ffc658" name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Customer Preferences - Car Types</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Sedan', value: 45 },
                        { name: 'SUV', value: 30 },
                        { name: 'Truck', value: 15 },
                        { name: 'Hatchback', value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Customer Preferences - Price Range</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'R0-R100k', value: 10 },
                        { name: 'R100k-R200k', value: 35 },
                        { name: 'R200k-R300k', value: 40 },
                        { name: 'R300k+', value: 15 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
