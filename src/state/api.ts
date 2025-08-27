import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils"
// Import from generated Prisma Client
import type { Customer, Employee, Car, Dealership, Sale, TestDrive, FinancingApplication, Review, Inquiry } from "@prisma/client"

// Extended types with relations
export interface InquiryWithRelations extends Inquiry {
  car?: Car;
  customer?: Customer;
  employee?: Employee;
  dealership?: Dealership;
}

export interface SaleWithRelations extends Sale {
  car?: Car;
  customer?: Customer;
  employee?: Employee;
  dealership?: Dealership;
  financing?: FinancingApplication;
}
// Legacy types that might still be in use
import type { Application, Lease, Manager, Payment, Property, Room, Tenant } from "@/types/prismaTypes"
// Import the Cognito User type if available, or define a minimal structure
import type { ExtendedAuthUser as CognitoAuthUser } from '@/types/cognito';
// Import RTK Query types
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { TagDescription } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

import { FiltersState } from "./index";  // FiltersState is defined in index.ts, not in slices folder


// Use relative paths for Next.js API routes
const API_BASE_URL = '/api';
// No need to check for environment variables since we're using relative paths

// --- Define a specific type for the authenticated user state ---
// Define Admin type to match the structure needed for admin users
export interface Admin {
  id: number;
  cognitoId: string;
  name: string;
  email: string;
  phoneNumber?: string; // Add phoneNumber field to match usage in the code
}

export interface AppUser {
  cognitoInfo: CognitoAuthUser; // Use the type from aws-amplify/auth
  userInfo: Customer | Employee | Admin;   // The user details from your database (Customer, Employee, or Admin)
  userRole: "customer" | "employee" | "admin";
}
// --- End AppUser Definition ---

// Define the valid tag types used throughout the API slice
type CacheTagType = "Applications" | "Employees" | "Customers" | "Cars" | "CarDetails" | "Sales" | "TestDrives" | "FinancingApplications" | "Admins" | "CustomerDashboard" | "CustomerFavorites" | "Properties" | "PropertyDetails" | "Leases" | "Payments" | "Rooms" | "Managers" | "Tenants" | "Dealerships" | "DealershipDetails" | "Inquiries";


export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    timeout: 60000, // Increase timeout to 60 seconds
    prepareHeaders: async (headers) => {
      try {
        const session = await fetchAuthSession();
        const idToken = session.tokens?.idToken?.toString();
        if (idToken) {
          headers.set("Authorization", `Bearer ${idToken}`);
        }
      } catch (error) {
        // Silently handle auth errors - this allows non-authenticated users to access public endpoints
        // User not authenticated, continuing as guest
      }
      return headers;
    },
    // Add response handling to properly handle non-JSON responses
    validateStatus: (response, body) => {
      if (response.status === 404) {
        // Return empty array for 404s on list endpoints
        if (response.url.includes('/rooms')) {
          return true;
        }
      }
      return response.status >= 200 && response.status < 300;
    },
    // Add custom response handling with retry logic
    async fetchFn(input, init) {
      const maxRetries = 3;
      let retries = 0;
      let lastError;

      while (retries < maxRetries) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(input, {
            ...init,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // If upstream rejected due to payload too large, synthesize friendly JSON
          if (response.status === 413) {
            return new Response(JSON.stringify({
              error: true,
              status: 413,
              message: 'Upload too large. Reduce number/size of images or compress before retrying.',
              hint: 'Try fewer images at once or upload in smaller batches.'
            }), { status: 413, headers: response.headers });
          }
          // Clone the response before reading it
          const clonedResponse = response.clone();

          try {
            // Prefer JSON but fall back to text without throwing parse errors
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const data = await response.json();
              return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
            } else {
              const text = await response.text();
              // Attempt a secondary JSON parse (some APIs mislabel)
              try {
                const parsed = JSON.parse(text);
                return new Response(JSON.stringify(parsed), {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers
                });
              } catch {
                // Wrap plain text in a JSON envelope so RTK Query doesn't choke
                return new Response(JSON.stringify({ raw: text }), {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers
                });
              }
            }
          } catch (e) {
            if (response.status === 404 && response.url.includes('/rooms')) {
              return new Response(JSON.stringify([]), {
                status: 200,
                statusText: 'OK',
                headers: response.headers
              });
            }
            const fallbackTxt = await clonedResponse.text().catch(()=> '');
            return new Response(JSON.stringify({ error: true, status: response.status, body: fallbackTxt.slice(0,500) }), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        } catch (error) {
          lastError = error;
          retries++;
          // API request failed, retry attempt

          if (retries >= maxRetries) {
            throw error;
          }

          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // This should never be reached due to the throw in the loop, but TypeScript needs it
      throw lastError;
    }
  }),
  reducerPath: "api",
  tagTypes: ["Employees", "Customers", "Cars", "CarDetails", "Sales", "TestDrives", "FinancingApplications", "Applications", "Admins", "CustomerDashboard", "CustomerFavorites", "Properties", "PropertyDetails", "Leases", "Payments", "Rooms", "Managers", "Tenants", "Dealerships", "DealershipDetails", "Inquiries", "Reviews"],
  endpoints: (build) => ({
    // --- Use the new AppUser type ---
    getAuthUser: build.query<AppUser, void>({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        // Define userDetailsResponse at the highest scope so it's accessible throughout the function
        let userDetailsResponse: any = { error: { status: 500, error: "Initialization error" } };
        
        try {
          let cognitoUser: CognitoAuthUser | undefined;
          
          const session = await fetchAuthSession();
          // Auth session fetched
          
          // Check if we have a valid session with tokens before attempting to get current user
          if (!session?.tokens?.idToken) {
            return { 
              error: { 
                status: 401, 
                error: "No valid session found",
                data: "User not authenticated"
              } 
            } as const;
          }
          
          const idToken = session.tokens.idToken;
          
          try {
            const authUser = await getCurrentUser();
            // Convert standard AuthUser to ExtendedAuthUser
            cognitoUser = {
              ...authUser,
              signInDetails: authUser.signInDetails ? {
                ...authUser.signInDetails,
                attributes: {
                  'custom:role': idToken.payload["custom:role"] as string
                }
              } : undefined
            } as CognitoAuthUser;
            // Cognito user fetched
            
            const rawUserRole = idToken.payload["custom:role"] as string;
            // Get email from idToken payload instead of non-existent username property
            const userEmail = typeof idToken.payload.email === 'string' ? 
              idToken.payload.email.toLowerCase() : '';



            if (!cognitoUser) {

              // Instead of returning null, return a proper error object
              // This ensures type compatibility with RTK Query
              return { 
                error: { 
                  status: 401, 
                  error: "No authenticated user found",
                  data: "User not authenticated"
                } 
              } as const;
            }

            // Check if user is an admin based on role AND special email
            // Only consider a user an admin if they have both the admin role AND the admin email
            // OR if they explicitly have the admin role set
            const isAdmin = (rawUserRole === "admin" && userEmail === "admin@student24.co.za") || 
                          (rawUserRole === "admin");
            
            // Determine user role with proper admin handling
            // Make sure to respect the actual role in the token
            const userRole = isAdmin ? "admin" : 
                           (rawUserRole === "employee" ? "employee" : 
                           (rawUserRole === "customer" ? "customer" : "customer")) as "customer" | "employee" | "admin";
            

            
            // Determine the endpoint based on user role, but don't set endpoint for admin users
            // as we'll handle them separately without an API call
            let endpoint = "";
            if (userRole === "employee") {
              endpoint = `/employees/${cognitoUser.userId}`;
            } else if (userRole === "customer") {
              endpoint = `/customers/${cognitoUser.userId}`;
            }
          
            // For admin users, construct admin info directly without API call
            if (userRole === "admin") {
               
              // Extract a better name from the email or user attributes
              let adminName = "";
               
              // Try to get name from user attributes if available
              // Use the name from ID token if available
              if (idToken.payload.name) {
                adminName = idToken.payload.name as string;
              } 
              // If email is available, use part before @ as name
              else if (userEmail && userEmail !== "admin@student24.co.za") {
                const emailName = userEmail.split('@')[0];
                // Convert email name to proper case (e.g., john.doe -> John Doe)
                adminName = emailName
                  .replace(/\./g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());
              }
               
              // If we still don't have a name, use a generic one
              if (!adminName) {
                adminName = "Admin User";
              }
              
              const adminInfo: Admin = {
                id: 0, // Use appropriate ID or generate one
                cognitoId: cognitoUser.userId || "",
                name: adminName,
                email: userEmail || ""
              };
              
              // Return admin user directly
              const appUserData: AppUser = {
                cognitoInfo: cognitoUser,
                userInfo: adminInfo,
                userRole: "admin",
              };


              return { data: appUserData } as const;
            }
            

            
            // Only attempt to fetch user details if we have a valid endpoint
            if (endpoint) {
              try {
                userDetailsResponse = await fetchWithBQ(endpoint);
                
                // User details response
              } catch (error) {
                return { 
                  error: { 
                    status: 401, 
                    error: "Error fetching user details",
                    data: error instanceof Error ? error.message : "Unknown error"
                  } 
                } as const;
              }
            } else {

              // Return early with appropriate error for missing endpoint
              return {
                error: {
                  status: 400,
                  error: "Invalid user role or missing endpoint",
                  data: "Could not determine appropriate API endpoint for user role"
                }
              } as const;
            }
          } catch (error) {
            return { 
              error: { 
                status: 401, 
                error: "Authentication error",
                data: error instanceof Error ? error.message : "Unknown error"
              } 
            } as const;
          }

          // Determine user role based on custom attributes
          let determinedUserRole: "customer" | "employee" | "admin";
          const userRole = cognitoUser?.signInDetails?.attributes?.['custom:role'];
          
          if (userRole === 'admin') {
            determinedUserRole = 'admin';
          } else if (userRole === 'employee') {
            determinedUserRole = 'employee';
          } else {
            determinedUserRole = 'customer';
          }

          // if user doesn't exist or there's a timeout, create new user
          if (userDetailsResponse.error && 
              ((userDetailsResponse.error as any).status === 404 || 
               (userDetailsResponse.error as any).status === 504)) {

            if (!cognitoUser) {
              return {
                error: {
                  status: 401,
                  error: "No Cognito user found",
                  data: "Unable to retrieve Cognito user information"
                }
              } as const;
            }
            
            userDetailsResponse = await createNewUserInDatabase(cognitoUser, idToken, determinedUserRole, fetchWithBQ);
            // New user creation response
          }

          if(userDetailsResponse.error){
            
            // Check if this is a database connection error
            if (userDetailsResponse.error.status === 500 && 
                (typeof userDetailsResponse.error.data === 'string' && (
                 userDetailsResponse.error.data.includes('prisma') || 
                 userDetailsResponse.error.data.includes('database')))) {
              return { 
                error: { 
                  status: 500, 
                  error: "Database connection error",
                  data: "Please check your database connection"
                } 
              } as const;
            }
            
            // For 403 errors (role-based access issues)
            if (userDetailsResponse.error.status === 403) {
              return { 
                error: { 
                  status: 403, 
                  error: "Permission denied",
                  data: "Your role doesn't have access to this resource"
                } 
              } as const;
            }
            
            throw userDetailsResponse.error;
          }

          // --- Construct the AppUser object ---
          const appUserData: AppUser = {
            cognitoInfo: cognitoUser,
            userInfo: userDetailsResponse.data as Customer | Employee | Admin,
            userRole: determinedUserRole,
          };


          return { data: appUserData } as const;
        } catch (error: any) {
            
            // More detailed error message construction
            const errorMessage = error?.message || 
                               error?.data?.message || 
                               (error?.status === 401 ? "Authentication failed" : 
                                error?.status === 404 ? "User not found" :
                                error?.status === 504 ? "Server timeout - please try again" :
                                "Could not fetch user data");
                               
            // If this is a timeout error, we can return a fallback user state
            if (error?.status === 504) {

              // You could return a cached user here if available
              // For now, we'll just return the error
            }
            
            return { 
                error: { 
                    status: error?.status || 'CUSTOM_ERROR', 
                    error: errorMessage,
                    details: error
                } 
            } as const;
        }
      },
      providesTags: (result) => result?.userInfo
        ? (result.userRole === 'employee'
            ? [{ type: 'Employees', id: (result.userInfo as Employee).id }]
            : [{ type: 'Customers', id: (result.userInfo as Customer).id }])
        : [],
    }),

    // --- Car Endpoints ---
    getCars: build.query<Car[], any>({
      query: (filters = {}) => {
        const params = cleanParams(filters);
        // Corrected endpoint from 'vehicles' to 'cars'
        return { url: "cars", params };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Cars" as const, id })), { type: "Cars", id: "LIST" }]
          : [{ type: "Cars", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch cars.",
        });
      },
    }),

    getCar: build.query<Car, number>({
      // Corrected endpoint from 'vehicles' to 'cars'
      query: (id) => `cars/${id}`,
      providesTags: (result) => result ? [{ type: "CarDetails", id: result.id }] : [],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Failed to load car details
        }
      },
    }),

    createCar: build.mutation<Car, FormData>({
      query: (carData) => ({
        // Corrected endpoint from 'vehicles' to 'cars'
        url: 'cars',
        method: 'POST',
        body: carData,
      }),
      invalidatesTags: [{ type: "Cars", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Car created successfully!",
          error: "Failed to create car.",
        });
      },
    }),

    updateCar: build.mutation<Car, { id: string; carData: FormData }>({
      query: ({ id, carData }) => ({
        url: `/cars/${id}`,
        method: 'PUT',
        body: carData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Cars', id }, { type: 'CarDetails', id }],
    }),

    deleteCar: build.mutation<void, string>({
      query: (id) => ({
        url: `/cars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Cars', id }],
    }),

    getCarById: build.query<Car, string>({
      query: (id) => `/cars/${id}`,
      providesTags: (result, error, id) => [{ type: 'CarDetails', id }],
    }),
    
    // --- Dealership Endpoints ---
    getDealerships: build.query<Dealership[], void>({
      query: () => '/dealerships',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Dealerships' as const, id })),
              { type: 'Dealerships', id: 'LIST' },
            ]
          : [{ type: 'Dealerships', id: 'LIST' }],
    }),

    getDealershipById: build.query<Dealership, string>({
      query: (id) => `/dealerships/${id}`,
      providesTags: (result, error, id) => [{ type: 'DealershipDetails', id }],
    }),

    // Sales endpoints
    getSales: build.query<SaleWithRelations[], { customerId?: string; employeeId?: string; carId?: string; dealershipId?: string; } | void>({
      query: (params) => {
        if (!params) { 
          return "sales";
        }
        const searchParams = new URLSearchParams();
        if (params.customerId) searchParams.append('customerId', params.customerId);
        if (params.employeeId) searchParams.append('employeeId', params.employeeId);
        if (params.carId) searchParams.append('carId', params.carId);
        if (params.dealershipId) searchParams.append('dealershipId', params.dealershipId);
        return `sales?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Sales" as const, id })), { type: "Sales", id: "LIST" }]
          : [{ type: "Sales", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch sales.",
        });
      },
    }),

    // Test drives endpoints
    getTestDrives: build.query<TestDrive[], void>({
      // Path corrected to match Next.js route /api/test-drives
      query: () => "test-drives",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "TestDrives" as const, id })), { type: "TestDrives", id: "LIST" }]
          : [{ type: "TestDrives", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch test drives.",
        });
      },
    }),

    // Create test drive
    createTestDrive: build.mutation<any, {
      carId: number;
      customerId: string;
      scheduledDate: string;
      dealershipId: number;
      notes?: string;
      contactInfo?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    }>({
      query: (testDriveData) => ({
        url: "test-drives",
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: testDriveData,
      }),
      invalidatesTags: [{ type: "TestDrives", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Test drive scheduled successfully!",
          error: "Failed to schedule test drive.",
        });
      },
    }),

    // Create car reservation
    createReservation: build.mutation<any, {
      carId: number;
      customerId: string;
      dealershipId: number;
      employeeId?: string;
      contactInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        zipCode?: string;
      };
      financing?: {
        financingOption: "cash" | "financing" | "lease";
        downPayment?: number;
        monthlyIncome?: number;
        employmentStatus?: string;
      };
      tradeIn?: {
        hasTradeIn: boolean;
        tradeInDetails?: string;
      };
      notes?: string;
    }>({
      query: (reservationData) => ({
        url: "reservations",
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: reservationData,
      }),
      invalidatesTags: [{ type: "Cars", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Car reserved successfully!",
          error: "Failed to reserve car.",
        });
      },
    }),

    // Financing applications endpoints
    getFinancingApplications: build.query<any[], { status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) {
          queryParams.append("status", params.status);
        }
        const queryString = queryParams.toString();
        return `financing-applications${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "FinancingApplications" as const, id })), { type: "FinancingApplications", id: "LIST" }]
          : [{ type: "FinancingApplications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch financing applications.",
        });
      },
    }),

    getFinancingApplication: build.query<any, string>({
      query: (id) => `financing-applications/${id}`,
      providesTags: (result, error, id) => [{ type: "FinancingApplications", id }],
    }),

    createFinancingApplication: build.mutation<any, {
      loanAmount: number;
      interestRate: number;
      termMonths: number;
      monthlyPayment: number;
      customerId: string;
      creditScore?: number;
      annualIncome?: number;
    }>({
      query: (applicationData) => ({
        url: "financing-applications",
        method: "POST",
        body: applicationData,
      }),
      invalidatesTags: [{ type: "FinancingApplications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Financing application created successfully!",
          error: "Failed to create financing application.",
        });
      },
    }),

    updateFinancingApplication: build.mutation<any, {
      id: string;
      loanAmount?: number;
      interestRate?: number;
      termMonths?: number;
      monthlyPayment?: number;
      status?: string;
      creditScore?: number;
      annualIncome?: number;
      approvalDate?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `financing-applications/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "FinancingApplications", id },
        { type: "FinancingApplications", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Financing application updated successfully!",
          error: "Failed to update financing application.",
        });
      },
    }),

    deleteFinancingApplication: build.mutation<void, string>({
      query: (id) => ({
        url: `financing-applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "FinancingApplications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Financing application deleted successfully!",
          error: "Failed to delete financing application.",
        });
      },
    }),

    // Admin endpoints for car dealership
    getAllEmployees: build.query<Employee[], { status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) {
          queryParams.append("status", params.status);
        }
        const queryString = queryParams.toString();
        return `admin/employees${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Employees" as const, id })), { type: "Employees", id: "LIST" }]
          : [{ type: "Employees", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch employees.",
        });
      },
    }),

    getAllCustomers: build.query<Customer[], void>({
      query: () => "admin/customers",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Customers" as const, id })), { type: "Customers", id: "LIST" }]
          : [{ type: "Customers", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch customers.",
        });
      },
    }),

    getEmployeeDetails: build.query<Employee, string>({
      query: (employeeId) => `admin/employees/${employeeId}`,
      providesTags: (result, error, id) => [{ type: "Employees", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch employee details.",
        });
      },
    }),

    getCustomerDetails: build.query<Customer, string>({
      query: (customerId) => `admin/customers/${customerId}`,
      providesTags: (result, error, id) => [{ type: "Customers", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch customer details.",
        });
      },
    }),

    updateEmployeeStatus: build.mutation<Employee, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `admin/employees/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Employees", id },
        { type: "Employees", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Employee status updated successfully!",
          error: "Failed to update employee status.",
        });
      },
    }),

    deleteEmployee: build.mutation<{ success: boolean; message: string }, string>({
      query: (employeeId) => ({
        url: `admin/employees/${employeeId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Employee deleted successfully!",
          error: "Failed to delete employee.",
        });
      },
    }),

    updateAdminSettings: build.mutation<{ success: boolean; message: string }, { name?: string; email?: string; phoneNumber?: string }>({
      query: (data) => ({
        url: "admin/settings/update",
        method: "POST",
        body: data
      }),
      invalidatesTags: [{ type: "Admins", id: "CURRENT" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Admin settings updated successfully!",
          error: "Failed to update admin settings."
        });
      },
    }),

    // Property related endpoints (keeping legacy for backward compatibility)
    getProperties: build.query<Property[], Partial<FiltersState> & { favoriteIds?: number[] }>({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: (filters as any).beds,
          baths: (filters as any).baths,
          propertyType: (filters as any).propertyType,
          squareFeetMin: (filters as any).squareFeet?.[0],
          squareFeetMax: (filters as any).squareFeet?.[1],
          amenities: (filters as any).amenities?.join(","),
          availableFrom: (filters as any).availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Properties" as const, id })), { type: "Properties", id: "LIST" }]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => {
        return {
          url: `properties/${id}`,
          method: 'GET',
        };
      },
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          return { data: null };
        }
        return response;
      },
      providesTags: (result) => result ? [{ type: "PropertyDetails", id: result.id }] : [{ type: "PropertyDetails", id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Failed to load property details
        }
      },
    }),

    // Create property with JSON data (no files)
    createProperty: build.mutation<Property, { propertyData: any, photoFiles?: File[] }>({
      async queryFn({ propertyData, photoFiles }, { dispatch, getState }, _extraOptions, baseQuery) {
        try {
          // First create the property without photos
          // Creating property
          const propertyResponse = await baseQuery({
            url: 'properties',
            method: 'POST',
            // Ensure the body is properly serialized as JSON
            body: JSON.stringify({ ...propertyData, photoUrls: [] }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (propertyResponse.error) {
            return { error: propertyResponse.error as FetchBaseQueryError };
          }
          
          const property = propertyResponse.data as Property;
          
          // If we have files to upload, do it in a second step
          if (photoFiles && photoFiles.length > 0) {
            try {
              // Upload each file individually
              const uploadPromises = photoFiles.map(async (file) => {
                // Uploading photo
                const formData = new FormData();
                formData.append('photo', file);
                formData.append('propertyId', property.id.toString());
                
                // Use a more direct approach for FormData
                const uploadResponse = await fetch(`/api/properties/${property.id}/photos`, {
                  method: 'POST',
                  body: formData,
                  // Don't set Content-Type, let the browser handle it
                }).then(res => res.json()).catch(err => {
                  return { error: { status: 'FETCH_ERROR', error: err.message } };
                });
                
                // Convert the fetch response to the format expected by RTK Query
                if (uploadResponse.error) {
                  throw new Error(uploadResponse.error.message || 'Error uploading photo');
                }
                
                return uploadResponse;
              });
              
              // Wait for all uploads to complete
              const uploadResults = await Promise.all(uploadPromises);
              // All photos uploaded successfully
              
              // Get the updated property with photo URLs
              const updatedPropertyResponse = await baseQuery({
                url: `properties/${property.id}`,
                method: 'GET',
              });
              
              if (updatedPropertyResponse.error) {
                return { error: updatedPropertyResponse.error as FetchBaseQueryError };
              }
              
              return { data: updatedPropertyResponse.data as Property };
            } catch (uploadError) {
              // Return the property even if photo upload failed
              return { data: property };
            }
          }
          
          return { data: property };
        } catch (error) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR',
              error: error instanceof Error ? error.message : String(error),
            } as FetchBaseQueryError 
          };
        }
      },
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        result ? { type: "PropertyDetails", id: result.id } : { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),

    updateProperty: build.mutation<Property, { id: string; body: FormData }>({
        query: ({ id, body }) => {
            // Create a new FormData object to avoid modifying the original
            const cleanFormData = new FormData();
            
            // Copy all fields except replacePhotos
            for (const [key, value] of body.entries()) {
                if (key !== 'replacePhotos') {
                    cleanFormData.append(key, value);
                }
            }
            
            return {
                url: `properties/${id}`,
                method: "PUT",
                body: cleanFormData,
            };
        },
        invalidatesTags: (result, error, { id }) => [
            { type: "Properties", id: "LIST" },
            { type: "PropertyDetails", id: Number(id) },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
            await withToast(queryFulfilled, {
                success: "Property updated successfully!",
                error: "Failed to update property.",
            });
        },
    }),

    deleteProperty: build.mutation<{ message: string; id: number }, { id: number; managerCognitoId?: string }>({
        query: ({ id, managerCognitoId }) => {
            // Ensure ID is a number
            const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
            
            // Build the URL with the manager ID as part of the query string
            const url = `properties/${numericId}`;
            
            return {
                url,
                method: "DELETE",
                params: managerCognitoId ? { managerCognitoId } : undefined,
            };
        },
        transformErrorResponse: (response: any) => {
            const message = response.data?.message || 
                          `Failed to delete property (Status: ${response.status})`;
            return { data: { message } };
        },
        invalidatesTags: (result, error, { id }) => [
            { type: "Properties", id: "LIST" },
            { type: "PropertyDetails", id },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
            try {
                const result = await queryFulfilled;
                toast.success("Property deleted successfully!");
            } catch (error: any) {
                // Error deleting property
                toast.error(error?.data?.message || "Failed to delete property.");
            }
        },
    }),


    // Customer related endpoints
    getCustomer: build.query<Customer, string>({
      query: (cognitoId) => `customers/${cognitoId}`,
      providesTags: (result) => (result ? [{ type: "Customers", id: result.id }] : []),
      // No error toast for customer profile loading
    }),

    getCurrentFavorites: build.query<Car[], string | 'skip'>({
      query: (cognitoId) => {
        // If skip indicator is passed, don't make the API call
        if (cognitoId === 'skip') {
          throw new Error('Skip query');
        }
        return `customers/${cognitoId}/favorites`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Cars" as const, id })), { type: "Cars", id: "LIST" }]
          : [{ type: "Cars", id: "LIST" }],
      async onQueryStarted(cognitoId, { queryFulfilled, dispatch }) {
        // Don't show error toast for skipped queries
        if (cognitoId === 'skip') return;

        try {
          await queryFulfilled;
        } catch (error: any) {
          // Only show error toast for non-404 errors to reduce noise
          if (error?.error?.status !== 404) {
            toast.error("Failed to fetch favorites.");
          }
        }
      },
    }),

    updateCustomerSettings: build.mutation<Customer, { cognitoId: string } & Partial<Customer>>({
      query: ({ cognitoId, ...updatedCustomer }) => ({
        url: `customers/${cognitoId}`,
        method: "PUT",
        body: updatedCustomer,
      }),
      invalidatesTags: (result) => (result ? [{ type: "Customers", id: result.id }] : []),
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    addFavoriteCar: build.mutation<Customer, { cognitoId: string; carId: number }>({
      query: ({ cognitoId, carId }) => ({
        url: `customers/${cognitoId}/favorites/${carId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { cognitoId }) => [
        // Invalidate specific customer data
        { type: "Customers", id: cognitoId },
        // Invalidate customer in general list
        { type: "Customers", id: "LIST" },
        // Invalidate all cars since favorites status changes
        { type: "Cars", id: "LIST" },
        // Force refetch customer dashboard data
        { type: "CustomerDashboard", id: cognitoId },
        // Force refetch customer favorites
        { type: "CustomerFavorites", id: cognitoId },
      ],
      async onQueryStarted({ cognitoId, carId }, { dispatch, queryFulfilled }) {
        // Optimistic update for customer data
        const patchResult = dispatch(
          api.util.updateQueryData('getCustomer', cognitoId, (draft) => {
            // Add favorites property if it doesn't exist
            if (draft && !(draft as any).favorites) {
              (draft as any).favorites = [];
            }
            if (draft && (draft as any).favorites) {
              // Check if car is already in favorites to prevent duplicates
              if (!(draft as any).favorites.some((fav: any) => fav.id === carId)) {
                // Add car ID to favorites (simplified, real data would have more fields)
                (draft as any).favorites.push({ id: carId });
              }
            }
          })
        );
        
        try {
          // Wait for the actual API call
          const result = await queryFulfilled;
          toast.success("Added to favorites!");
        } catch (error) {
          // Undo the optimistic update if API call fails
          patchResult.undo();
          toast.error("Failed to add to favorites.");
        }
      },
    }),

    removeFavoriteCar: build.mutation<Customer, { cognitoId: string; carId: number }>({
      query: ({ cognitoId, carId }) => ({
        url: `customers/${cognitoId}/favorites/${carId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { cognitoId }) => [
        // Invalidate specific customer data
        { type: "Customers", id: cognitoId },
        // Invalidate customer in general list
        { type: "Customers", id: "LIST" },
        // Invalidate all cars since favorites status changes
        { type: "Cars", id: "LIST" },
        // Force refetch customer dashboard data
        { type: "CustomerDashboard", id: cognitoId },
        // Force refetch customer favorites
        { type: "CustomerFavorites", id: cognitoId },
      ],
      async onQueryStarted({ cognitoId, carId }, { dispatch, queryFulfilled }) {
        // Optimistic update for customer data
        const patchResult = dispatch(
          api.util.updateQueryData('getCustomer', cognitoId, (draft) => {
            if (draft && (draft as any).favorites) {
              // Filter out the car being removed
              (draft as any).favorites = (draft as any).favorites.filter((fav: any) => fav.id !== carId);
            }
          })
        );
        
        try {
          // Wait for the actual API call
          const result = await queryFulfilled;
          toast.success("Removed from favorites!");
        } catch (error) {
          // Undo the optimistic update if API call fails
          patchResult.undo();
          toast.error("Failed to remove from favorites.");
        }
      },
    }),

    // Employee related endpoints
    getEmployeeCars: build.query<Car[], string>({
      query: (cognitoId) => `employees/${cognitoId}/cars`,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Cars' as const, id })), { type: 'Cars', id: 'LIST' }]
          : [{ type: 'Cars', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load employee cars.",
        });
      },
    }),

    updateEmployeeSettings: build.mutation<Employee, { cognitoId: string } & Partial<Employee>>({
      query: ({ cognitoId, ...updatedEmployee }) => ({
        url: `employees/${cognitoId}`,
        method: "PUT",
        body: updatedEmployee,
      }),
      invalidatesTags: (result) => (result ? [{ type: "Employees", id: result.id }] : []),
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    getPropertiesByManagerId: build.query<Property[], string>({
      query: (managerId) => `managers/${managerId}/properties`,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Properties' as const, id })),
              { type: 'Properties', id: 'LIST' }, // For list-wide invalidation
            ]
          : [{ type: 'Properties', id: 'LIST' }],
    }),

    // Room related endpoints
    getRooms: build.query<Room[], number>({
      query: (propertyId) => ({
        url: `properties/${propertyId}/rooms`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        if (!response || !Array.isArray(response)) {
          // Invalid rooms response
          return [];
        }
        return response;
      },
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          return { data: [] };
        }
        return response;
      },
      providesTags: (result, error, propertyId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rooms' as const, id })),
              { type: 'Rooms', id: 'LIST' },
              // Add a property-specific tag to ensure this query is invalidated when rooms for this property change
              { type: 'Rooms', id: `property-${propertyId}` },
            ]
          : [{ type: 'Rooms', id: 'LIST' }, { type: 'Rooms', id: `property-${propertyId}` }],
      onQueryStarted: async (propertyId, { queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          // Just log the error without showing a toast
          // Error fetching rooms
          // Don't show toast for room fetch errors as it's disruptive
          // This prevents unnecessary error notifications
        }
      },
    }),

    getRoom: build.query<Room, { propertyId: number, roomId: number }>({
      query: ({ propertyId, roomId }) => `rooms/${roomId}?propertyId=${propertyId}`,
      
      providesTags: (result, error, { roomId }) => [{ type: "Rooms", id: roomId }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load room details."
        });
      },
    }),

    createRoom: build.mutation<Room, { propertyId: number, body: FormData }>({
      // Using a custom queryFn to handle both room creation and photo uploads in one step
      async queryFn({ propertyId, body }, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          // Get auth token for API requests
          let token;
          try {
            const session = await fetchAuthSession();
            token = session.tokens?.idToken?.toString();
          } catch (e) {
            // Not authenticated
            throw new Error('Authentication required');
          }
          
          // Send the entire FormData with both room data and photos in a single request
          // The server will handle extracting room data and processing photos
          const createRoomResponse = await fetch(`${API_BASE_URL}/properties/${propertyId}/create-room`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // Don't set Content-Type, let the browser set it correctly for FormData
            },
            body: body // Send the entire FormData object with both room data and photos
          });
          
          if (!createRoomResponse.ok) {
            // Handle error response
            let errorData;
            try {
              errorData = await createRoomResponse.json();
            } catch {
              errorData = { message: 'Unknown server error' };
            }
            
            // Transform error based on status code
            let transformedError = errorData;
            if (createRoomResponse.status === 403) {
            } else if (createRoomResponse.status === 400) {
              transformedError = { 
                message: errorData?.message || "Invalid room data",
                details: errorData
              };
            } else if (createRoomResponse.status === 401) {
              transformedError = { message: "Unauthorized. Please log in again." };
            } else if (createRoomResponse.status === 403) {
              transformedError = { message: "You don't have permission to create rooms" };
            } else {
              // For other errors, try to get a meaningful message
              const errorMessage = errorData?.message ||
                errorData?.error ||
                "Failed to create room";
              transformedError = {
                message: errorMessage,
                details: errorData
              };
            }

            return { error: { status: createRoomResponse.status, data: transformedError } };
          }

          const data = createRoomResponse ? await createRoomResponse.json() : null;
          // The server returns the room directly (moved from transformResponse)
          return { data };
        } catch (error) {
          // Room creation error
          
          // Transform the error to match our error format
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const transformedError = {
            message: errorMessage,
            details: error instanceof Error ? { stack: error.stack } : error
          };
          
          return { 
            error: { 
              status: 500, 
              data: transformedError 
            } 
          };
        }
      },

      invalidatesTags: (result, error) => {
        if (error) return [];
        return result ? [
          { type: 'Rooms', id: 'LIST' },
          { type: 'Rooms', id: result.id },
          { type: 'PropertyDetails', id: result.propertyId },
          // Also invalidate rooms for this property specifically
          { type: 'Rooms', id: `property-${result.propertyId}` }
        ] : [];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error: any) {
          // Error creating room
          
          // Show a more detailed error message - ensure it's a string
          let errorMessage = "Failed to create room";
          
          if (typeof error?.data?.message === 'string') {
            errorMessage = error.data.message;
          } else if (typeof error?.data?.error === 'string') {
            errorMessage = error.data.error;
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
        }
      },
    }),

    updateRoom: build.mutation<Room, { propertyId: number, roomId: number; data: FormData }>({
      query: ({ propertyId, roomId, data }) => ({
        url: `rooms/${roomId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: any) => {
        // The server returns the room directly
        return response;
      },
      transformErrorResponse: (response: any) => {
        if (response.status === 404) {
          return { message: "Room not found" };
        }
        if (response.status === 400) {
          return { message: response.data?.message || "Invalid room data" };
        }
        return { message: response.data?.message || "Failed to update room" };
      },
      invalidatesTags: (result, error, { roomId, propertyId }) => {
        if (error) return [];
        return [
          { type: 'Rooms', id: roomId },
          { type: 'Rooms', id: 'LIST' },
          { type: 'PropertyDetails', id: propertyId || result?.propertyId },
          { type: 'Properties', id: propertyId || result?.propertyId }
        ];
      },
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Room updated successfully!");
        } catch (error: any) {
          // Error updating room
          toast.error(error?.data?.message || "Failed to update room");
        }
      },
    }),

    deleteRoom: build.mutation<{ message: string; id: number }, { propertyId: number, roomId: number }>({
      query: ({ propertyId, roomId }) => ({
        url: `rooms/${roomId}?propertyId=${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { roomId }) => [
          { type: "Rooms", id: roomId },
          { type: "Rooms", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Room deleted successfully!",
          error: "Failed to delete room.",
        });
      },
    }),

    // Lease related endpoints
    getLeases: build.query<Lease[], void>({
      query: () => "leases",
      providesTags: (result) =>
          result
              ? [...result.map(({ id }) => ({ type: 'Leases' as const, id })), { type: 'Leases', id: 'LIST' }]
              : [{ type: 'Leases', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => ({
        url: `properties/${propertyId}/leases`,
        method: 'GET',
      }),
      transformErrorResponse: (response: any) => {
        if (response?.status === 404) {
          // Property leases not found
          return { data: [] }; // Return empty array on 404
        }
        return response;
      },
      providesTags: (result, error, propertyId) => [
          ...(result ?? []).map(({ id }) => ({ type: 'Leases' as const, id })),
          { type: 'Leases', id: 'LIST', propertyId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Failed to fetch property leases
        }
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: (result, error, leaseId) => [
          ...(result ?? []).map(({ id }) => ({ type: 'Payments' as const, id })),
          { type: 'Payments', id: 'LIST', leaseId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    // Application related endpoints
    getApplications: build.query<Application[], { userId?: string; userType?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) {
          queryParams.append("userId", params.userId.toString());
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }
        const queryString = queryParams.toString();
        return `applications${queryString ? `?${queryString}` : ''}`;
      },
       providesTags: (result) =>
          result
              ? [...result.map(({ id }) => ({ type: 'Applications' as const, id })), { type: 'Applications', id: 'LIST' }]
              : [{ type: 'Applications', id: 'LIST' }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<Application & { lease?: Lease }, { id: number; status: string }>({
      query: ({ id, status }) => {
        console.log('RTK Query sending request:', { id, status });
        
        // Make sure status is properly formatted - backend expects 'Pending', 'Approved', or 'Denied'
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        // Use query parameters instead of a request body
        const params = new URLSearchParams();
        params.append('status', formattedStatus);
        console.log('Using URL parameters instead of body:', params.toString());
        
        return {
          // Include status as a query parameter to avoid body parsing issues
          url: `applications/${id}/status?${params.toString()}`,
          method: "PUT",
          // Include body as well for redundancy (some API frameworks prefer body)
          body: { status: formattedStatus },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      transformErrorResponse: (response) => {
        console.error('Application status update error response:', response);
        return response;
      },
      // --- CORRECTED invalidatesTags ---
      invalidatesTags: (result, error, { id }) => {
          // Explicitly define the type of the tags array
          const tags: TagDescription<CacheTagType>[] = [
              { type: 'Applications', id },
              { type: 'Applications', id: 'LIST' },
          ];
          // Conditionally add Lease tags if a lease was affected
          if (result?.lease) {
              tags.push({ type: 'Leases', id: 'LIST' });
              tags.push({ type: 'Leases', id: result.lease.id });
          }
          return tags;
      },
      // --- END CORRECTION ---
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated successfully!",
          error: "Failed to update application status.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body: body, // Don't stringify - RTK Query will handle this
        headers: {
          'Content-Type': 'application/json'
        },
      }),
      invalidatesTags: [{ type: "Applications", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application submitted successfully!",
          error: "Failed to submit application.",
        });
      },
    }),

    // Admin endpoints
    getAllManagers: build.query<(Manager & { status: 'Pending' | 'Active' | 'Disabled' | 'Banned' })[], { status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.status) {
          queryParams.append("status", params.status);
        }
        const queryString = queryParams.toString();
        return `admin/managers${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Managers" as const, id })), { type: "Managers", id: "LIST" }]
          : [{ type: "Managers", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch managers.",
        });
      },
    }),

    updateManagerStatus: build.mutation<Manager, { cognitoId: string; status: string; notes?: string }>({
      query: ({ cognitoId, status, notes }) => {
        // Build query string with parameters
        const params = new URLSearchParams();
        params.append('cognitoId', cognitoId);
        params.append('status', status);
        if (notes) params.append('notes', notes);
        
        return {
          url: `admin/managers/update-status?${params.toString()}`,
          method: "GET",
          // No body needed since we're using URL parameters
        };
      },
      invalidatesTags: (result) => [
        { type: "Managers", id: result?.id },
        { type: "Managers", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Manager status updated successfully!",
          error: "Failed to update manager status.",
        });
      },
    }),
    
    deleteManager: build.mutation<{ success: boolean, message: string, deletedManager: Manager }, string>({
      query: (cognitoId) => {
        // Build query string with parameters
        const params = new URLSearchParams();
        params.append('cognitoId', cognitoId);
        
        return {
          url: `admin/managers/delete?${params.toString()}`,
          method: "GET",
        };
      },
      invalidatesTags: (result) => [
        { type: "Managers", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Manager deleted successfully!",
          error: "Failed to delete manager.",
        });
      },
    }),
    
    getManagerDetails: build.query<{
      id: number;
      name: string;
      email: string;
      phoneNumber: string;
      status: string;
      properties: {
        id: number;
        name: string;
        address: string;
        tenantCount: number;
        roomCount: number;
      }[];
      tenants: {
        id: number;
        name: string;
        email: string;
        propertyName: string;
      }[];
      stats: {
        propertyCount: number;
        tenantCount: number;
        occupancyRate: string;
        averageRent: string;
      }
    }, string>({
      query: (managerId) => {
        return {
          url: `admin/managers/${managerId}`,
          method: "GET",
        };
      },
      providesTags: (result, error, id) => [{ type: "Managers", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch landlord details.",
        });
      },
    }),
    
    getAllTenants: build.query<(Tenant & { favoriteCount?: number; applicationCount?: number; leaseCount?: number })[], void>({
      query: () => {
        return {
          url: `admin/tenants`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Tenants" as const, id })), { type: "Tenants", id: "LIST" }]
          : [{ type: "Tenants", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch tenants.",
        });
      },
    }),
    
    getTenantDetails: build.query<{
      tenantInfo: Tenant,
      favorites: {
        id: number;
        name: string;
        address: string;
        landlord: string;
        landlordEmail: string;
        landlordId: number;
        propertyId: number;
      }[];
      applications: {
        id: number;
        propertyName: string;
        propertyId: number;
        landlord: string;
        landlordEmail: string;
        landlordId: number;
        status: string;
        date: string;
      }[];
      leases: {
        id: number;
        propertyName: string;
        propertyId: number;
        startDate: string;
        endDate: string;
        rent: string;
        landlord: string;
        landlordEmail: string;
        landlordId: number;
      }[];
    }, string>({
      query: (tenantId) => {
        return {
          url: `admin/tenants/${tenantId}`,
          method: "GET",
        };
      },
      providesTags: (result, error, id) => [{ type: "Tenants", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch tenant details.",
        });
      },
    }),

    // Inquiry endpoints
    getInquiries: build.query<InquiryWithRelations[], { customerId?: string; employeeId?: string; carId?: string; dealershipId?: string; status?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.customerId) queryParams.append("customerId", params.customerId);
        if (params.employeeId) queryParams.append("employeeId", params.employeeId);
        if (params.carId) queryParams.append("carId", params.carId);
        if (params.dealershipId) queryParams.append("dealershipId", params.dealershipId);
        if (params.status) queryParams.append("status", params.status);
        const queryString = queryParams.toString();
        return `inquiries${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Inquiries" as const, id })), { type: "Inquiries", id: "LIST" }]
          : [{ type: "Inquiries", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch inquiries.",
        });
      },
    }),

    getInquiry: build.query<InquiryWithRelations, number>({
      query: (id) => `inquiries/${id}`,
      providesTags: (result, error, id) => [{ type: "Inquiries", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch inquiry details.",
        });
      },
    }),

    updateInquiry: build.mutation<InquiryWithRelations, { id: number; updateData: Partial<Inquiry> }>({
      query: ({ id, updateData }) => ({
        url: `inquiries/${id}`,
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Inquiries", id },
        { type: "Inquiries", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Inquiry updated successfully!",
          error: "Failed to update inquiry.",
        });
      },
    }),

    createInquiry: build.mutation<InquiryWithRelations, Partial<Inquiry>>({
      query: (newInquiry) => ({
        url: "inquiries",
        method: "POST",
        body: newInquiry,
      }),
      invalidatesTags: [{ type: "Inquiries", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Inquiry created successfully!",
          error: "Failed to create inquiry.",
        });
      },
    }),

    deleteInquiry: build.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `inquiries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Inquiries", id },
        { type: "Inquiries", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Inquiry deleted successfully!",
          error: "Failed to delete inquiry.",
        });
      },
    }),

    // Review endpoints
    getReviews: build.query<Review[], { carId?: number; customerId?: string; rating?: number }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.carId) queryParams.append("carId", params.carId.toString());
        if (params.customerId) queryParams.append("customerId", params.customerId);
        if (params.rating) queryParams.append("rating", params.rating.toString());
        const queryString = queryParams.toString();
        return `reviews${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Reviews" as const, id })), { type: "Reviews", id: "LIST" }]
          : [{ type: "Reviews", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch reviews.",
        });
      },
    }),

    getReview: build.query<Review, number>({
      query: (id) => `reviews/${id}`,
      providesTags: (result, error, id) => [{ type: "Reviews", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch review details.",
        });
      },
    }),

    createReview: build.mutation<Review, {
      carId: number;
      customerId: string;
      rating: number;
      title: string;
      comment: string;
      customerName?: string;
      customerEmail?: string;
    }>({
      query: (reviewData) => {
        console.log("Creating review with data:", reviewData);
        return {
          url: "reviews",
          method: "POST",
          body: reviewData,
        };
      },
      invalidatesTags: [
        { type: "Reviews", id: "LIST" },
        { type: "Cars", id: "LIST" }, // Invalidate cars since ratings might change
      ],
    }),

    updateReview: build.mutation<Review, { 
      id: number; 
      rating?: number; 
      title?: string; 
      comment?: string; 
    }>({
      query: ({ id, ...data }) => ({
        url: `reviews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Reviews", id },
        { type: "Reviews", id: "LIST" },
        { type: "Cars", id: "LIST" }, // Invalidate cars since ratings might change
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Review updated successfully!",
          error: "Failed to update review.",
        });
      },
    }),

    deleteReview: build.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Reviews", id },
        { type: "Reviews", id: "LIST" },
        { type: "Cars", id: "LIST" }, // Invalidate cars since ratings might change
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Review deleted successfully!",
          error: "Failed to delete review.",
        });
      },
    }),

  }),
});

// Export hooks for usage in components
export const {
  useGetAuthUserQuery,
  // Customer endpoints
  useUpdateCustomerSettingsMutation,
  useGetCurrentFavoritesQuery,
  useGetCustomerQuery,
  useAddFavoriteCarMutation,
  useRemoveFavoriteCarMutation,
  // Employee endpoints
  useUpdateEmployeeSettingsMutation,
  useGetEmployeeCarsQuery,
  // Car endpoints
  useGetCarsQuery,
  useGetCarQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useGetDealershipsQuery,
  // Sales, test drives, financing
  useGetSalesQuery,
  useGetTestDrivesQuery,
  useCreateTestDriveMutation,
  useCreateReservationMutation,
  useGetFinancingApplicationsQuery,
  useGetFinancingApplicationQuery,
  useCreateFinancingApplicationMutation,
  useUpdateFinancingApplicationMutation,
  useDeleteFinancingApplicationMutation,
  // Admin endpoints
  useGetAllEmployeesQuery,
  useGetEmployeeDetailsQuery,
  useUpdateEmployeeStatusMutation,
  useDeleteEmployeeMutation,
  useGetAllCustomersQuery,
  useGetCustomerDetailsQuery,
  useUpdateAdminSettingsMutation,
  // Legacy property endpoints (for backward compatibility)
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetPropertiesByManagerIdQuery,
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
  useGetAllManagersQuery,
  useGetManagerDetailsQuery,
  useUpdateManagerStatusMutation,
  useDeleteManagerMutation,
  useGetAllTenantsQuery,
  useGetTenantDetailsQuery,
  // Inquiry endpoints
  useGetInquiriesQuery,
  useGetInquiryQuery,
  useUpdateInquiryMutation,
  useCreateInquiryMutation,
  useDeleteInquiryMutation,
  // Review endpoints
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = api;
