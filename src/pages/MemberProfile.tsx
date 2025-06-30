
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Calendar, DollarSign, Download, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  useGetMemberQuery, 
  useGetMemberPaymentsQuery, 
  useGetAttendanceQuery, 
  useRecordAttendanceMutation 
} from '@/store/api/apiSlice';

export const MemberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useAuth();

  // Use Redux Toolkit queries
  const { data: memberData, isLoading: memberLoading } = useGetMemberQuery(id!);
  const { data: paymentsData, isLoading: paymentsLoading } = useGetMemberPaymentsQuery(id!);
  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery({ member_id: id });
  
  // Mutation for marking attendance
  const [recordAttendance, { isLoading: loadingAttendance }] = useRecordAttendanceMutation();

  const member = memberData?.data || memberData?.member;
  const payments = paymentsData?.data || paymentsData?.payments || [];
  const attendance = attendanceData?.data || [];

  const markAttendance = async (status: 'present' | 'absent') => {
    if (!id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log('Marking attendance:', { member_id: id, date: today, status });
      
      await recordAttendance({
        member_id: id,
        date: today,
        status
      }).unwrap();

      toast({
        title: "Success",
        description: `Attendance marked as ${status}`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const exportReport = async (type: string) => {
    try {
      console.log('Exporting report:', type);
      // This would need to be implemented in the backend
      toast({
        title: "Info",
        description: "Export functionality needs backend implementation",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  if (memberLoading || paymentsLoading || attendanceLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading member profile...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Member not found</div>
        <Button variant="outline" onClick={() => navigate('/members')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Members
        </Button>
      </div>
    );
  }

  const todayAttendance = attendance.find((a: any) => a.date === new Date().toISOString().split('T')[0]);

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
                ) : todayAttendance.status === 'late' ? (
                  <XCircle className="w-5 h-5 text-yellow-500" />
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
                <Button size="sm" onClick={() => navigate('/payments')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Manage Payments
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
                  {payments.length > 0 ? (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getCurrencySymbol()}{payment.amount_paid}</TableCell>
                        <TableCell>{getCurrencySymbol()}{payment.total_amount}</TableCell>
                        <TableCell>{getCurrencySymbol()}{payment.due_amount}</TableCell>
                        <TableCell className="capitalize">{payment.payment_method}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  )}
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
                  {attendance.length > 0 ? (
                    attendance.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              record.status === 'present' ? 'default' : 
                              record.status === 'late' ? 'secondary' : 
                              'destructive'
                            }
                            className={
                              record.status === 'present' ? 'bg-green-500' :
                              record.status === 'late' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
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
                <Button variant="outline" onClick={() => exportReport('members')}>
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
                <Button variant="outline" onClick={() => exportReport('financial-summary')}>
                  <Download className="w-4 h-4 mr-2" />
                  Financial Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
