
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = 'https://gymbackend-eight.vercel.app/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Payment {
  id: string;
  member_id: string;
  amount_paid: string;
  payment_date: string;
  created_at: string;
}

interface Attendance {
  id: string;
  member_id: string;
  date: string;
  status: string;
  created_at: string;
}

interface Batch {
  id: string;
  name: string;
  schedule_time: string;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  duration: number;
  price: string;
  created_at: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Member', 'Payment', 'Attendance', 'Batch', 'Plan'],
  endpoints: (builder) => ({
    // Members endpoints
    getMembers: builder.query<ApiResponse<{ members: Member[] }>, void>({
      query: () => '/members',
      providesTags: ['Member'],
    }),
    getMember: builder.query<ApiResponse<Member>, string>({
      query: (id) => `/members/${id}`,
      providesTags: (result, error, id) => [{ type: 'Member', id }],
    }),
    
    // Payments endpoints
    getPayments: builder.query<ApiResponse<Payment[]>, void>({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    getMemberPayments: builder.query<ApiResponse<Payment[]>, string>({
      query: (memberId) => `/payments/member/${memberId}`,
      providesTags: (result, error, memberId) => [{ type: 'Payment', id: memberId }],
    }),
    
    // Attendance endpoints
    getAttendance: builder.query<ApiResponse<Attendance[]>, { date?: string } | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params && typeof params === 'object') {
          Object.entries(params).forEach(([key, value]) => {
            if (value) searchParams.append(key, value.toString());
          });
        }
        return `/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
      providesTags: ['Attendance'],
    }),
    recordAttendance: builder.mutation<ApiResponse<Attendance>, any>({
      query: (data) => ({
        url: '/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    
    // Batches endpoints
    getBatches: builder.query<ApiResponse<Batch[]>, void>({
      query: () => '/batches',
      providesTags: ['Batch'],
    }),
    
    // Plans endpoints
    getPlans: builder.query<ApiResponse<Plan[]>, void>({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useGetMemberQuery,
  useGetPaymentsQuery,
  useGetMemberPaymentsQuery,
  useGetAttendanceQuery,
  useRecordAttendanceMutation,
  useGetBatchesQuery,
  useGetPlansQuery,
} = apiSlice;
