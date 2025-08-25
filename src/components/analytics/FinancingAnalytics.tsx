"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Legend,
  Line,
  LineChart,
} from 'recharts';

type FinancingData = {
  monthly: Array<{
    month: string;
    applications: number;
    approved: number;
    rejected: number;
  }>;
  byVehicleType: Array<{
    vehicleType: string;
    count: number;
    percentage: number;
  }>;
  byAgeGroup: Array<{
    ageGroup: string;
    count: number;
    percentage: number;
  }>;
  approvalRateTimeline: Array<{
    month: string;
    approvalRate: number;
  }>;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function FinancingAnalytics() {
  const [data, setData] = useState<FinancingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    const fetchFinancingAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/financing/analytics');
        if (!res.ok) throw new Error('Failed to fetch financing analytics');
        
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching financing analytics:', error);
        // Fallback demo data
        setData({
          monthly: [
            { month: 'Jan', applications: 12, approved: 8, rejected: 4 },
            { month: 'Feb', applications: 15, approved: 10, rejected: 5 },
            { month: 'Mar', applications: 18, approved: 12, rejected: 6 },
            { month: 'Apr', applications: 16, approved: 9, rejected: 7 },
            { month: 'May', applications: 20, approved: 14, rejected: 6 },
            { month: 'Jun', applications: 22, approved: 16, rejected: 6 },
          ],
          byVehicleType: [
            { vehicleType: 'Sedan', count: 30, percentage: 38 },
            { vehicleType: 'SUV', count: 25, percentage: 32 },
            { vehicleType: 'Hatchback', count: 15, percentage: 19 },
            { vehicleType: 'Truck', count: 8, percentage: 10 },
          ],
          byAgeGroup: [
            { ageGroup: '18-25', count: 22, percentage: 28 },
            { ageGroup: '26-35', count: 35, percentage: 44 },
            { ageGroup: '36-45', count: 15, percentage: 19 },
            { ageGroup: '45+', count: 7, percentage: 9 },
          ],
          approvalRateTimeline: [
            { month: 'Jan', approvalRate: 66 },
            { month: 'Feb', approvalRate: 67 },
            { month: 'Mar', approvalRate: 67 },
            { month: 'Apr', approvalRate: 56 },
            { month: 'May', approvalRate: 70 },
            { month: 'Jun', approvalRate: 73 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFinancingAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[180px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly">Monthly Applications</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle Types</TabsTrigger>
          <TabsTrigger value="age">Age Groups</TabsTrigger>
          <TabsTrigger value="approval">Approval Rate</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financing Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.monthly}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="applications" name="Total Applications" fill="#8884d8" />
                    <Bar dataKey="approved" name="Approved" fill="#82ca9d" />
                    <Bar dataKey="rejected" name="Rejected" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Vehicle Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.byVehicleType}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="vehicleType"
                    >
                      {data?.byVehicleType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="age">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.byAgeGroup}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="ageGroup"
                    >
                      {data?.byAgeGroup.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <CardTitle>Approval Rate Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.approvalRateTimeline}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="approvalRate"
                      name="Approval Rate"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
