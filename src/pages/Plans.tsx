
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, DollarSign, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_in_months: number;
  description: string;
  created_at: string;
  updated_at: string;
  members: { count: number }[];
}

const getCurrencySymbol = (country: string) => {
  const currencyMap: { [key: string]: string } = {
    'Pakistan': '₨',
    'India': '₹',
    'United States': '$',
    'United Kingdom': '£',
    'Canada': 'C$',
    'Australia': 'A$',
    'Germany': '€',
    'France': '€',
    'Japan': '¥',
    'China': '¥',
  };
  return currencyMap[country] || '$';
};

export const Plans = () => {
  const { apiCall } = useApi();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(user?.country || 'United States');

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiCall('/plans')
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: string) => apiCall(`/plans/${planId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
      setDeletingPlanId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete plan",
        variant: "destructive",
      });
      setDeletingPlanId(null);
    },
  });

  const plans: Plan[] = plansData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-muted-foreground">Manage your gym membership plans</p>
        </div>
        <Link to="/plans/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{plan.name}</span>
                <div className="flex space-x-2">
                  <Link to={`/plans/${plan.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(plan.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {currencySymbol}{plan.price}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {plan.duration_in_months} month{plan.duration_in_months > 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  {plan.members?.[0]?.count || 0} members
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No plans found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first membership plan.</p>
              <Link to="/plans/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
