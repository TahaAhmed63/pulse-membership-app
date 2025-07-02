
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = 'https://gymbackend-eight.vercel.app/api';

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
    getMembers: builder.query({
      query: () => '/members',
      providesTags: ['Member'],
    }),
    getMember: builder.query({
      query: (id) => `/members/${id}`,
      providesTags: (result, error, id) => [{ type: 'Member', id }],
    }),
    
    // Payments endpoints
    getPayments: builder.query({
      query: () => '/payments',
      providesTags: ['Payment'],
    }),
    getMemberPayments: builder.query({
      query: (memberId) => `/payments/member/${memberId}`,
      providesTags: (result, error, memberId) => [{ type: 'Payment', id: memberId }],
    }),
    
    // Attendance endpoints
    getAttendance: builder.query({
      query: (params) => {
        if (!params) return '/attendance';
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value.toString());
        });
        return `/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
      providesTags: ['Attendance'],
    }),
    recordAttendance: builder.mutation({
      query: (data) => ({
        url: '/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    
    // Batches endpoints
    getBatches: builder.query({
      query: () => '/batches',
      providesTags: ['Batch'],
    }),
    
    // Plans endpoints
    getPlans: builder.query({
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
