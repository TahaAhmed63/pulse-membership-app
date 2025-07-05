import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Check, X, Search, Download } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

interface Member {
  id: string;
  name: string;
  phone: string;
  batch_id: string;
  status: 'active' | 'inactive';
}

interface Batch {
  id: string;
  name: string;
  schedule_time: string;
}

interface AttendanceRecord {
  id?: string;
  member_id: string;
  date: string;
  status: 'present' | 'absent';
  member?: Member;
}

export const Attendance = () => {
  const { apiCall, loading } = useApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, selectedBatch]);

  const fetchInitialData = async () => {
    try {
      const [membersResponse, batchesResponse] = await Promise.all([
        apiCall('/members'),
        apiCall('/batches')
      ]);

      if (membersResponse?.data) {
        setMembers(membersResponse.data.filter((m: Member) => m.status === 'active'));
      }

      if (batchesResponse?.data) {
        // Filter out batches with empty or null IDs
        setBatches(batchesResponse.data.filter((batch: Batch) => batch.id && batch.id.trim() !== ''));
      } else if (batchesResponse?.batches) {
        // Filter out batches with empty or null IDs
        setBatches(batchesResponse.batches.filter((batch: Batch) => batch.id && batch.id.trim() !== ''));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedBatch !== 'all' && { batch_id: selectedBatch })
      });

      const response = await apiCall(`/attendance?${params}`);
      
      if (response?.data) {
        setAttendanceRecords(response.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
    }
  };

  const markAttendance = async (memberId: string, status: 'present' | 'absent') => {
    try {
      const attendanceData = {
        member_id: memberId,
        date: selectedDate,
        status: status
      };

      const response = await apiCall('/attendance', {
        method: 'POST',
        body: JSON.stringify(attendanceData)
      });

      if (response) {
        toast({
          title: "Success",
          description: `Attendance marked as ${status}`,
        });
        fetchAttendance(); // Refresh attendance data
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  const getAttendanceStatus = (memberId: string) => {
    const record = attendanceRecords.find(r => r.member_id === memberId);
    return record?.status || null;
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    
    const matchesBatch = selectedBatch === 'all' || member.batch_id === selectedBatch;
    
    return matchesSearch && matchesBatch;
  });

  const exportAttendance = async () => {
    try {
      const params = new URLSearchParams({
        start_date: selectedDate,
        end_date: selectedDate
      });

      const response = await apiCall(`/reports/attendance-summary?${params}`);
      
      if (response?.data) {
        // Create CSV content
        const csvContent = [
          ['Member Name', 'Status', 'Date'].join(','),
          ...filteredMembers.map(member => {
            const status = getAttendanceStatus(member.id) || 'not marked';
            return [member.name, status, selectedDate].join(',');
          })
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_${selectedDate}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Attendance exported successfully",
        });
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
      toast({
        title: "Error",
        description: "Failed to export attendance",
        variant: "destructive"
      });
    }
  };

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalMarked = presentCount + absentCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Track member attendance</p>
        </div>
        <Button onClick={exportAttendance} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{filteredMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id || 'unknown'}>
                      {batch.name} - {batch.schedule_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Mark attendance for {filteredMembers.length} members on {new Date(selectedDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const status = getAttendanceStatus(member.id);
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>
                        {status ? (
                          <Badge 
                            variant={status === 'present' ? 'default' : 'secondary'}
                            className={status === 'present' ? 'bg-green-500' : 'bg-red-500'}
                          >
                            {status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Marked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => markAttendance(member.id, 'present')}
                            variant={status === 'present' ? 'default' : 'outline'}
                            className={status === 'present' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markAttendance(member.id, 'absent')}
                            variant={status === 'absent' ? 'destructive' : 'outline'}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
