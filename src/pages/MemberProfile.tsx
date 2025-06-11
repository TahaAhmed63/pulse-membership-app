
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Calendar, DollarSign, Download, CheckCircle, XCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  join_date: string;
  status: 'active' | 'inactive';
  plan_end_date: string;
}

interface Payment {
  id: string;
  amount_paid: number;
  total_amount: number;
  due_amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
}

interface Attendance {
  id: string;
  date: string;
  status: 'present' | 'absent';
}

export const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { getCurrencySymbol } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMemberData();
    }
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const [memberResponse, paymentsResponse, attendanceResponse] = await Promise.all([
        apiCall(`/members/${id}`),
        apiCall(`/members/${id}/payments`),
        apiCall(`/members/${id}/attendance`)
      ]);

      if (memberResponse?.member) setMember(memberResponse.member);
      if (paymentsResponse?.payments) setPayments(paymentsResponse.payments);
      if (attendanceResponse?.attendance) setAttendance(attendanceResponse.attendance);
    } catch (error) {
      console.error('Error fetching member data:', error);
    }
  };

  const markAttendance = async (status: 'present' | 'absent') => {
    if (!id) return;

    setLoadingAttendance(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await apiCall('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          member_id: id,
          date: today,
          status
        })
      });

      if (response) {
        toast({
          title: "Success",
          description: `Attendance marked as ${status}`,
        });
        fetchMemberData(); // Refresh data
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const exportReport = async (type: string) => {
    try {
      const response = await apiCall(`/members/${id}/export/${type}`);
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (!member) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading member profile...</div>
      </div>
    );
  }

  const todayAttendance = attendance.find(a => a.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/members')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-gray-600 mt-1">Member Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/members/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Member
          </Button>
        </div>
      </div>

      {/* Member Info Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {member.name}
                <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                  {member.status}
                </Badge>
              </CardTitle>
              <CardDescription>Member since {new Date(member.join_date).toLocaleDateString()}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Plan expires</p>
              <p className="font-medium">{new Date(member.plan_end_date).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{member.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{member.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium capitalize">{member.gender || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {todayAttendance ? (
              <div className="flex items-center gap-2">
                {todayAttendance.status === 'present' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="capitalize font-medium">{todayAttendance.status}</span>
                <span className="text-gray-500">for today</span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Mark attendance for today:</span>
                <Button
                  size="sm"
                  onClick={() => markAttendance('present')}
                  disabled={loadingAttendance}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAttendance('absent')}
                  disabled={loadingAttendance}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Absent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payment History</CardTitle>
                <Button size="sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getCurrencySymbol()}{payment.amount_paid}</TableCell>
                      <TableCell>{getCurrencySymbol()}{payment.total_amount}</TableCell>
                      <TableCell>{getCurrencySymbol()}{payment.due_amount}</TableCell>
                      <TableCell className="capitalize">{payment.payment_method}</TableCell>
                      <TableCell>{payment.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Download Reports</CardTitle>
              <CardDescription>Export member data and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => exportReport('full')}>
                  <Download className="w-4 h-4 mr-2" />
                  Full Member Report
                </Button>
                <Button variant="outline" onClick={() => exportReport('payments')}>
                  <Download className="w-4 h-4 mr-2" />
                  Payment Report
                </Button>
                <Button variant="outline" onClick={() => exportReport('attendance')}>
                  <Download className="w-4 h-4 mr-2" />
                  Attendance Report
                </Button>
                <Button variant="outline" onClick={() => exportReport('partial-payments')}>
                  <Download className="w-4 h-4 mr-2" />
                  Partial Payment Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
