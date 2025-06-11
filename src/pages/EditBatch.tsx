
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const batchSchema = z.object({
  name: z.string().min(1, 'Batch name is required'),
  schedule_time: z.string().min(1, 'Schedule time is required'),
});

type BatchFormData = z.infer<typeof batchSchema>;

export const EditBatch = () => {
  const { id } = useParams();
  const { apiCall } = useApi();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: batchData, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => apiCall(`/batches/${id}`),
    enabled: !!id,
  });

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: '',
      schedule_time: '',
    },
  });

  useEffect(() => {
    if (batchData?.data) {
      const batch = batchData.data;
      form.reset({
        name: batch.name,
        schedule_time: batch.schedule_time,
      });
    }
  }, [batchData, form]);

  const updateMutation = useMutation({
    mutationFn: (data: BatchFormData) => apiCall(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      toast({
        title: "Success",
        description: "Batch updated successfully",
      });
      navigate('/batches');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BatchFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading batch...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/batches">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batches
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Batch</h1>
          <p className="text-muted-foreground">Update batch information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter batch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schedule_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link to="/batches">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Batch'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
