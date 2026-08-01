import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ensureCsrfToken, addCsrfHeader } from './csrf';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

ensureCsrfToken();

const dynamicBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers) => addCsrfHeader(headers),
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: dynamicBaseQuery,
  tagTypes: ['Trip', 'Destination', 'Itinerary', 'Journal', 'Notification', 'Profile', 'Saved'],
  endpoints: (builder) => ({
    getTopTrips: builder.query({
      query: () => '/trips?limit=10',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Trip'],
    }),
    getLatestTrips: builder.query({
      query: () => '/trips/recent',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Trip'],
    }),
    getTrips: builder.query({
      query: (params) => `/trips?${new URLSearchParams(params || {}).toString()}`,
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Trip'],
    }),
    getTrip: builder.query({
      query: (id) => `/trips/${id}`,
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, id) => [{ type: 'Trip', id }],
    }),
    createTrip: builder.mutation({
      query: (body) => ({ url: '/trips', method: 'POST', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Trip'],
    }),
    updateTrip: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/trips/${id}`, method: 'PUT', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { id }) => [{ type: 'Trip', id }],
    }),
    deleteTrip: builder.mutation({
      query: (id) => ({ url: `/trips/${id}`, method: 'DELETE' }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Trip'],
    }),
    getDestinations: builder.query({
      query: (params) => `/destinations?${new URLSearchParams(params || {}).toString()}`,
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Destination'],
    }),
    getDestination: builder.query({
      query: (id) => `/destinations/${id}`,
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, id) => [{ type: 'Destination', id }],
    }),
    getExplore: builder.query({
      query: () => '/discover/trending',
      transformResponse: (res) => res?.data ?? res,
    }),
    getSeasonal: builder.query({
      query: (params) => `/discover/seasonal?${new URLSearchParams(params || {}).toString()}`,
      transformResponse: (res) => res?.data ?? res,
    }),
    getPersonalizedRecommendations: builder.query({
      query: () => '/recommendations/personalized',
      transformResponse: (res) => res?.data ?? res,
    }),
    getItineraries: builder.query({
      query: (tripId) => `/itineraries/${tripId}`,
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Itinerary'],
    }),
    createItinerary: builder.mutation({
      query: ({ tripId, ...body }) => ({ url: `/itineraries/${tripId}`, method: 'POST', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Itinerary'],
    }),
    getJournals: builder.query({
      query: () => '/journals',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Journal'],
    }),
    createJournal: builder.mutation({
      query: (body) => ({ url: '/journals', method: 'POST', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Journal'],
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Notification'],
    }),
    getSaved: builder.query({
      query: () => '/saved',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Saved'],
    }),
    saveItem: builder.mutation({
      query: (body) => ({ url: '/saved', method: 'POST', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Saved'],
    }),
    getWishlist: builder.query({
      query: () => '/wishlist',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Saved'],
    }),
    getDashboardSummary: builder.query({
      query: () => '/dashboard/summary',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Trip', 'Saved', 'Budget', 'Journal'],
    }),
    getProfile: builder.query({
      query: () => '/profile',
      transformResponse: (res) => res?.data ?? res,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/profile', method: 'PUT', body }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Profile'],
    }),
    searchDestinations: builder.query({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      transformResponse: (res) => res?.data ?? res,
    }),
  }),
});

export const {
  useGetTopTripsQuery,
  useGetLatestTripsQuery,
  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useGetDestinationsQuery,
  useGetDestinationQuery,
  useGetExploreQuery,
  useGetSeasonalQuery,
  useGetPersonalizedRecommendationsQuery,
  useGetItinerariesQuery,
  useCreateItineraryMutation,
  useGetJournalsQuery,
  useCreateJournalMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetSavedQuery,
  useSaveItemMutation,
  useGetWishlistQuery,
  useGetDashboardSummaryQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useSearchDestinationsQuery,
} = apiSlice;