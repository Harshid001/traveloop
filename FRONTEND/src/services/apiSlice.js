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
  tagTypes: ['Trip', 'Destination', 'Itinerary', 'Journal', 'Notification', 'Profile', 'Saved', 'Wishlist'],
  endpoints: (builder) => ({
    getTopTrips: builder.query({
      query: () => '/trips?limit=10',
      providesTags: ['Trip'],
    }),
    getLatestTrips: builder.query({
      query: () => '/trips/recent',
      providesTags: ['Trip'],
    }),
    getTrips: builder.query({
      query: (params) => `/trips?${new URLSearchParams(params || {}).toString()}`,
      providesTags: ['Trip'],
    }),
    getTrip: builder.query({
      query: (id) => `/trips/${id}`,
      providesTags: (result, error, id) => [{ type: 'Trip', id }],
    }),
    createTrip: builder.mutation({
      query: (body) => ({ url: '/trips', method: 'POST', body }),
      invalidatesTags: ['Trip'],
    }),
    updateTrip: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/trips/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Trip', id }],
    }),
    deleteTrip: builder.mutation({
      query: (id) => ({ url: `/trips/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Trip'],
    }),
    getDestinations: builder.query({
      query: (params) => `/destinations?${new URLSearchParams(params || {}).toString()}`,
      providesTags: ['Destination'],
    }),
    getDestination: builder.query({
      query: (id) => `/destinations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Destination', id }],
    }),
    getExplore: builder.query({
      query: () => '/discover/trending',
    }),
    getSeasonal: builder.query({
      query: (params) => `/discover/seasonal?${new URLSearchParams(params || {}).toString()}`,
    }),
    getItineraries: builder.query({
      query: (tripId) => `/itineraries/${tripId}`,
      providesTags: ['Itinerary'],
    }),
    createItinerary: builder.mutation({
      query: ({ tripId, ...body }) => ({ url: `/itineraries/${tripId}`, method: 'POST', body }),
      invalidatesTags: ['Itinerary'],
    }),
    getJournals: builder.query({
      query: () => '/journals',
      providesTags: ['Journal'],
    }),
    createJournal: builder.mutation({
      query: (body) => ({ url: '/journals', method: 'POST', body }),
      invalidatesTags: ['Journal'],
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    getSaved: builder.query({
      query: () => '/saved',
      providesTags: ['Saved'],
    }),
    saveItem: builder.mutation({
      query: (body) => ({ url: '/saved', method: 'POST', body }),
      invalidatesTags: ['Saved'],
    }),
    getWishlist: builder.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    getProfile: builder.query({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/profile', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),
    searchDestinations: builder.query({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
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
  useGetItinerariesQuery,
  useCreateItineraryMutation,
  useGetJournalsQuery,
  useCreateJournalMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetSavedQuery,
  useSaveItemMutation,
  useGetWishlistQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useSearchDestinationsQuery,
} = apiSlice;