# SmartRent API Testing Guide

Use this list to manually test the API using Thunder Client, Postman, or cURL.

## Base URL
`http://localhost:5001/api`

---

## AUTHENTICATION

### 1. Register Admin
- **METHOD:** POST
- **URL:** `/auth/register`
- **AUTH REQUIRED:** No
- **PURPOSE:** Create a new admin account
- **REQUEST BODY:**
  ```json
  {
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **EXPECTED STATUS:** 201 Created

### 2. Login Admin
- **METHOD:** POST
- **URL:** `/auth/login`
- **AUTH REQUIRED:** No
- **PURPOSE:** Authenticate and get JWT token
- **REQUEST BODY:**
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **EXPECTED STATUS:** 200 OK
- **NOTE:** Copy the `token` from the response to use in the `Authorization` header (`Bearer <token>`) for all subsequent requests.

### 3. Get Current Admin
- **METHOD:** GET
- **URL:** `/auth/me`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Get the authenticated user's details
- **EXPECTED STATUS:** 200 OK

---

## PROPERTIES

### 1. Get All Properties
- **METHOD:** GET
- **URL:** `/properties`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Fetch all properties
- **EXPECTED STATUS:** 200 OK

### 2. Get Single Property
- **METHOD:** GET
- **URL:** `/properties/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Fetch details of a single property
- **EXPECTED STATUS:** 200 OK

### 3. Create Property
- **METHOD:** POST
- **URL:** `/properties`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Add a new property
- **REQUEST BODY:**
  ```json
  {
    "name": "Sunrise Residency",
    "address": "123 Main St, Tech City",
    "type": "Apartment Complex",
    "floors": 3,
    "totalRooms": 15
  }
  ```
- **EXPECTED STATUS:** 201 Created

### 4. Update Property
- **METHOD:** PUT
- **URL:** `/properties/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Update property details
- **REQUEST BODY:** (any property field)
- **EXPECTED STATUS:** 200 OK

### 5. Delete Property
- **METHOD:** DELETE
- **URL:** `/properties/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Delete a property
- **EXPECTED STATUS:** 200 OK

---

## ROOMS

### 1. Get All Rooms
- **METHOD:** GET
- **URL:** `/rooms`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Fetch all rooms across all properties
- **EXPECTED STATUS:** 200 OK

### 2. Get Single Room
- **METHOD:** GET
- **URL:** `/rooms/:id`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

### 3. Create Room
- **METHOD:** POST
- **URL:** `/rooms`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Add a room to a property
- **REQUEST BODY:**
  ```json
  {
    "roomNumber": "101",
    "type": "Single",
    "rent": 5000,
    "property": "<Property_ID>"
  }
  ```
- **EXPECTED STATUS:** 201 Created

### 4. Update Room
- **METHOD:** PUT
- **URL:** `/rooms/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Change room details (e.g. rent or status)
- **EXPECTED STATUS:** 200 OK

### 5. Delete Room
- **METHOD:** DELETE
- **URL:** `/rooms/:id`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

---

## TENANTS

### 1. Get All Tenants
- **METHOD:** GET
- **URL:** `/tenants`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** List all tenants
- **EXPECTED STATUS:** 200 OK

### 2. Get Single Tenant
- **METHOD:** GET
- **URL:** `/tenants/:id`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

### 3. Create Tenant
- **METHOD:** POST
- **URL:** `/tenants`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Onboard a new tenant and assign them to a room
- **REQUEST BODY:**
  ```json
  {
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "rent": 6000,
    "address": "456 Side St",
    "room": "<Room_ID>" 
  }
  ```
- **EXPECTED STATUS:** 201 Created

### 4. Update Tenant
- **METHOD:** PUT
- **URL:** `/tenants/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Update tenant info or reassign room
- **EXPECTED STATUS:** 200 OK

### 5. Delete Tenant
- **METHOD:** DELETE
- **URL:** `/tenants/:id`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Remove tenant (also vacates their room)
- **EXPECTED STATUS:** 200 OK

---

## PAYMENTS

### 1. Get All Payments
- **METHOD:** GET
- **URL:** `/payments`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

### 2. Record Payment
- **METHOD:** POST
- **URL:** `/payments`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Submit a rent payment
- **REQUEST BODY:**
  ```json
  {
    "tenant": "<Tenant_ID>",
    "room": "<Room_ID>",
    "amount": 6000,
    "paymentMethod": "UPI"
  }
  ```
- **EXPECTED STATUS:** 201 Created

### 3. Delete Payment
- **METHOD:** DELETE
- **URL:** `/payments/:id`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

---

## DASHBOARD

### 1. Get Dashboard Stats
- **METHOD:** GET
- **URL:** `/dashboard`
- **AUTH REQUIRED:** Yes
- **PURPOSE:** Retrieve overall application stats and calculations
- **EXPECTED STATUS:** 200 OK

---

## NOTIFICATIONS

### 1. Get Notifications
- **METHOD:** GET
- **URL:** `/notifications`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

### 2. Mark Notification as Read
- **METHOD:** PUT
- **URL:** `/notifications/:id/read`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK

### 3. Delete Notification
- **METHOD:** DELETE
- **URL:** `/notifications/:id`
- **AUTH REQUIRED:** Yes
- **EXPECTED STATUS:** 200 OK
