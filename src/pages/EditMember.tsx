
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  join_date: string;
  status: 'active' | 'inactive';
  plan_id: string;
  batch_id: string;
  plan_end_date: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_in_months: number;
}

interface Batch {
  id: string;
  name: string;
  schedule_time: string;
}

export const EditMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [member, setMember] = useState<Member | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    join_date: '',
    status: 'active',
    plan_id: '',
    batch_id: '',
    plan_end_date: ''
  });

  useEffect(() => {
    if (id) {
      fetchMemberData();
      fetchPlansAndBatches();
    }
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const response = await apiCall(`/members/${id}`);
      if (response?.member) {
        const memberData = response.member;
        setMember(memberData);
        setFormData({
          name: memberData.name || '',
          phone: memberData.phone || '',
          email: memberData.email || '',
          dob: memberData.dob ? memberData.dob.split('T')[0] : '',
          gender: memberData.gender || '',
          join_date: memberData.join_date ? memberData.join_date.split('T')[0] : '',
          status: memberData.status || 'active',
          plan_id: memberData.plan_id || '',
          batch_id: memberData.batch_id || '',
          plan_end_date: memberData.plan_end_date ? memberData.plan_end_date.split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    }
  };

  const fetchPlansAndBatches = async () => {
    try {
      const [plansResponse, batchesResponse] = await Promise.all([
        apiCall('/plans'),
        apiCall('/batches')
      ]);
      
      if (plansResponse?.plans) setPlans(plansResponse.plans);
      if (batchesResponse?.batches) setBatches(batchesResponse.batches);
    } catch (error) {
      console.error('Error fetching plans and batches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiCall(`/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response) {
        toast({
          title: "Success",
          description: "Member updated successfully",
        });
        navigate(`/members/${id}`);
      }
    } catch (error) {
      console.error('Error updating member:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await apiCall(`/members/${id}`, {
        method: 'DELETE'
      });

      if (response) {
        toast({
          title: "Success",
          description: "Member deleted successfully",
        });
        navigate('/members');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!member) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading member data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(`/members/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Member</h1>
            <p className="text-gray-600 mt-1">Update {member.name}'s information</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Member
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {member.name}'s profile and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>Update the member details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="join_date">Join Date *</Label>
                <Input
                  id="join_date"
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => handleInputChange('join_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_end_date">Plan End Date</Label>
                <Input
                  id="plan_end_date"
                  type="date"
                  value={formData.plan_end_date}
                  onChange={(e) => handleInputChange('plan_end_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_id">Membership Plan</Label>
                <Select value={formData.plan_id} onValueChange={(value) => handleInputChange('plan_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.duration_in_months} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch_id">Batch</Label>
                <Select value={formData.batch_id} onValueChange={(value) => handleInputChange('batch_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} - {batch.schedule_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Member'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/members/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
