import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Edit, CalendarIcon, MoreHorizontal, DollarSign, Download, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const paymentSchema = z.object({
  member_id: z.string().min(1, 'Please select a member'),
  amount_paid: z.number().min(0, 'Amount paid must be positive'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  payment_date: z.date(),
  payment_method: z.string().min(1, 'Please select a payment method'),
  notes: z.string().optional(),
});

interface Member {
  id: string;
  name: string;
  plan_amount?: number;
}

interface Plan {
  id: string;
  name: string;
  amount: number;
}

interface Payment {
  id: string;
  member_id: string;
  amount_paid: number;
  total_amount: number;
  due_amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  member?: {
    id: string;
    name: string;
  };
}

export default function Payments() {
  const { apiCall, loading } = useApi();
  const { getCurrencySymbol } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      member_id: '',
      amount_paid: 0,
      total_amount: 0,
      payment_date: new Date(),
      payment_method: '',
      notes: '',
    },
  });

  const editForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      member_id: '',
      amount_paid: 0,
      total_amount: 0,
      payment_date: new Date(),
      payment_method: '',
      notes: '',
    },
  });

  useEffect(() => {
    fetchPayments();
    fetchMembers();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await apiCall('/payments');
      if (response?.success && response?.data) {
        setPayments(response.data);
      } else if (response?.payments) {
        setPayments(response.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiCall('/members');
      if (response?.success && response?.data) {
        setMembers(response.data);
      } else if (response?.members) {
        setMembers(response.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    }
  };

  const handleMemberSelect = async (memberId: string, formInstance: any) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMember(member);
      formInstance.setValue('member_id', memberId);
      
      // Fetch member's plan details to auto-fill total amount
      try {
        const memberResponse = await apiCall(`/members/${memberId}`);
        if (memberResponse?.success && memberResponse?.data?.plan_amount) {
          formInstance.setValue('total_amount', memberResponse.data.plan_amount);
        } else if (memberResponse?.member?.plan_amount) {
          formInstance.setValue('total_amount', memberResponse.member.plan_amount);
        }
      } catch (error) {
        console.error('Error fetching member plan:', error);
      }
    }
  };

  const calculateDueAmount = (totalAmount: number, amountPaid: number) => {
    return Math.max(0, totalAmount - amountPaid);
  };

  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    try {
      const paymentData = {
        ...data,
        due_amount: calculateDueAmount(data.total_amount, data.amount_paid),
        payment_date: data.payment_date.toISOString().split('T')[0],
      };

      const response = await apiCall('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      if (response?.success) {
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
        setIsAddDialogOpen(false);
        form.reset();
        setSelectedMember(null);
        fetchPayments();
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: z.infer<typeof paymentSchema>) => {
    if (!editingPayment) return;

    try {
      const paymentData = {
        ...data,
        due_amount: calculateDueAmount(data.total_amount, data.amount_paid),
        payment_date: data.payment_date.toISOString().split('T')[0],
      };

      const response = await apiCall(`/payments/${editingPayment.id}`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      });

      if (response?.success) {
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
        setIsEditDialogOpen(false);
        editForm.reset();
        setEditingPayment(null);
        fetchPayments();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    editForm.setValue('member_id', payment.member_id);
    editForm.setValue('amount_paid', payment.amount_paid);
    editForm.setValue('total_amount', payment.total_amount);
    editForm.setValue('payment_date', new Date(payment.payment_date));
    editForm.setValue('payment_method', payment.payment_method);
    editForm.setValue('notes', payment.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      const response = await apiCall(`/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (response?.success) {
        toast({
          title: "Success",
          description: "Payment deleted successfully",
        });
        fetchPayments();
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const exportPayments = async () => {
    try {
      const response = await apiCall('/payments/export');
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast({
        title: "Error",
        description: "Failed to export payments",
        variant: "destructive",
      });
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'UPI',
    'QR Code',
    'Credit Card',
    'Debit Card',
    'Online Payment'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage member payments and transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPayments}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Payment</DialogTitle>
                <DialogDescription>
                  Create a new payment record for a member
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="member_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member</FormLabel>
                        <Select onValueChange={(value) => handleMemberSelect(value, form)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount ({getCurrencySymbol()})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount_paid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Paid ({getCurrencySymbol()})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('total_amount') > 0 && form.watch('amount_paid') >= 0 && (
                    <div className="text-sm text-gray-600">
                      Due Amount: {getCurrencySymbol()}{calculateDueAmount(form.watch('total_amount'), form.watch('amount_paid'))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Payment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method} value={method.toLowerCase().replace(' ', '_')}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      Add Payment
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.member?.name || 'Unknown Member'}
                    </TableCell>
                    <TableCell>{getCurrencySymbol()}{payment.amount_paid}</TableCell>
                    <TableCell>{getCurrencySymbol()}{payment.total_amount}</TableCell>
                    <TableCell>
                      <span className={payment.due_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {getCurrencySymbol()}{payment.due_amount}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(payment)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment information
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="member_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select onValueChange={(value) => handleMemberSelect(value, editForm)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="total_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount ({getCurrencySymbol()})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="amount_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount Paid ({getCurrencySymbol()})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {editForm.watch('total_amount') > 0 && editForm.watch('amount_paid') >= 0 && (
                <div className="text-sm text-gray-600">
                  Due Amount: {getCurrencySymbol()}{calculateDueAmount(editForm.watch('total_amount'), editForm.watch('amount_paid'))}
                </div>
              )}

              <FormField
                control={editForm.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method.toLowerCase().replace(' ', '_')}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  Update Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
