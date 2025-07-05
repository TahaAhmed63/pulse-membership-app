
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';

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

export const AddMember = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: '',
    join_date: new Date().toISOString().split('T')[0],
    plan_id: '',
    batch_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchPlansAndBatches();
  }, []);

  const fetchPlansAndBatches = async () => {
    try {
      const [plansResponse, batchesResponse] = await Promise.all([
        apiCall('/plans'),
        apiCall('/batches')
      ]);
      
      console.log('Plans response:', plansResponse);
      console.log('Batches response:', batchesResponse);
      
      // Handle different response structures
      if (plansResponse?.data) {
        setPlans(plansResponse.data);
      } else if (plansResponse?.plans) {
        setPlans(plansResponse.plans);
      } else if (Array.isArray(plansResponse)) {
        setPlans(plansResponse);
      }
      
      if (batchesResponse?.data) {
        setBatches(batchesResponse.data);
      } else if (batchesResponse?.batches) {
        setBatches(batchesResponse.batches);
      } else if (Array.isArray(batchesResponse)) {
        setBatches(batchesResponse);
      }
    } catch (error) {
      console.error('Error fetching plans and batches:', error);
      toast({
        title: "Error",
        description: "Failed to load plans and batches",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await apiCall('/members', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          status: 'active'
        })
      });

      if (response) {
        toast({
          title: "Success",
          description: "Member added successfully",
        });
        navigate('/members');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/members')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Members
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Member</h1>
          <p className="text-gray-600 mt-1">Create a new gym member profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>Fill in the member details below</CardDescription>
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
                <Label htmlFor="plan_id">Membership Plan</Label>
                <Select value={formData.plan_id} onValueChange={(value) => handleInputChange('plan_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.length > 0 ? plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.duration_in_months} months
                      </SelectItem>
                    )) : (
                      <SelectItem value="" disabled>No plans available</SelectItem>
                    )}
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
                    {batches.length > 0 ? batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name} - {batch.schedule_time}
                      </SelectItem>
                    )) : (
                      <SelectItem value="" disabled>No batches available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about the member"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Adding Member...' : 'Add Member'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/members')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
