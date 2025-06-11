
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserX, DollarSign, Calendar } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalActiveMembers: number;
  totalInactiveMembers: number;
  totalPayments: number;
  todayAttendance: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalActiveMembers: 0,
    totalInactiveMembers: 0,
    totalPayments: 0,
    todayAttendance: 0,
  });
  const [paymentTrends, setPaymentTrends] = useState([]);
  const { apiCall, loading } = useApi();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch members
      const membersResponse = await apiCall('/members');
      if (membersResponse?.members) {
        const activeMembers = membersResponse.members.filter((m: any) => m.status === 'active').length;
        const inactiveMembers = membersResponse.members.filter((m: any) => m.status === 'inactive').length;
        
        setStats(prev => ({
          ...prev,
          totalActiveMembers: activeMembers,
          totalInactiveMembers: inactiveMembers,
        }));
      }

      // Fetch payments
      const paymentsResponse = await apiCall('/payments');
      if (paymentsResponse?.payments) {
        const totalPayments = paymentsResponse.payments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amount_paid), 0);
        setStats(prev => ({ ...prev, totalPayments }));
        
        // Process payment trends
        const monthlyData = processPaymentTrends(paymentsResponse.payments);
        setPaymentTrends(monthlyData);
      }

      // Fetch today's attendance
      const attendanceResponse = await apiCall('/attendance/today');
      if (attendanceResponse?.attendance) {
        setStats(prev => ({ 
          ...prev, 
          todayAttendance: attendanceResponse.attendance.filter((a: any) => a.status === 'present').length 
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const processPaymentTrends = (payments: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(payment.amount_paid);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months
  };

  const exportActiveMembers = async () => {
    try {
      const response = await apiCall('/members/export/active');
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error exporting active members:', error);
    }
  };

  const exportInactiveMembers = async () => {
    try {
      const response = await apiCall('/members/export/inactive');
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error exporting inactive members:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Active Members',
      value: stats.totalActiveMembers,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Inactive Members',
      value: stats.totalInactiveMembers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Payments Collected',
      value: `₹${stats.totalPayments.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your gym management overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportActiveMembers}>
            Export Active Members
          </Button>
          <Button variant="outline" onClick={exportInactiveMembers}>
            Export Inactive Members
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Trends</CardTitle>
          <CardDescription>Monthly payment collection over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
