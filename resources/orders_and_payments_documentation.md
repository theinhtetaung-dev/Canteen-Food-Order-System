# Orders and Payment Features Documentation

This document outlines the REST API endpoints and functionalities for the **Orders** and **Payment** features in the Canteen Food Order System.

---

## 1. Orders Feature

The Order feature provides comprehensive CRUD (Create, Read, Update, Delete) operations, including pagination and sorting, to efficiently manage food orders in the canteen.

### Base Path
`/api/orders`

### Endpoints

#### 1.1. Create a New Order
- **URL**: `/api/orders`
- **Method**: `POST`
- **Description**: Creates a new order.
- **Request Body**: `OrderRequestModel` (JSON)
- **Response**: `201 Created` with `OrderResponseModel` (JSON)

#### 1.2. Get Order by ID
- **URL**: `/api/orders/{id}`
- **Method**: `GET`
- **Description**: Retrieves a specific order's details by its ID.
- **Path Parameters**:
  - `id` (Integer): The ID of the order.
- **Response**: `200 OK` with `OrderResponseModel` (JSON)

#### 1.3. Get All Orders (Paginated)
- **URL**: `/api/orders`
- **Method**: `GET`
- **Description**: Retrieves a paginated list of all orders. Supports sorting and pagination.
- **Query Parameters**:
  - `page` (int, default: 0): The page number.
  - `size` (int, default: 10): The number of records per page.
  - `sortBy` (String, default: "createdAt"): The field to sort the results by.
  - `direction` (String, default: "desc"): The sorting direction (`asc` or `desc`).
- **Response**: `200 OK` with `Page<OrderResponseModel>` (JSON)

#### 1.4. Update Order Status
- **URL**: `/api/orders/{id}/status`
- **Method**: `PATCH`
- **Description**: Updates the status of an existing order.
- **Path Parameters**:
  - `id` (Integer): The ID of the order.
- **Query Parameters**:
  - `status` (String): The new status of the order (e.g., PENDING, COMPLETED, CANCELLED).
- **Response**: `200 OK` with updated `OrderResponseModel` (JSON)

#### 1.5. Delete Order
- **URL**: `/api/orders/{id}`
- **Method**: `DELETE`
- **Description**: Deletes an order from the system by its ID.
- **Path Parameters**:
  - `id` (Integer): The ID of the order.
- **Response**: `204 No Content`

---

## 2. Payment Feature

The Payment feature handles the creation and retrieval of payment transactions, integrating pagination for listing.

### Base Path
`/api/payments`

### Endpoints

#### 2.1. Create a New Payment
- **URL**: `/api/payments`
- **Method**: `POST`
- **Description**: Processes and creates a new payment record.
- **Request Body**: `PaymentRequestModel` (JSON)
- **Response**: `201 Created` with `PaymentResponseModel` (JSON)

#### 2.2. Get Payment by ID
- **URL**: `/api/payments/{id}`
- **Method**: `GET`
- **Description**: Retrieves specific details of a payment by its ID.
- **Path Parameters**:
  - `id` (Integer): The ID of the payment.
- **Response**: `200 OK` with `PaymentResponseModel` (JSON)

#### 2.3. Get All Payments (Paginated)
- **URL**: `/api/payments`
- **Method**: `GET`
- **Description**: Retrieves a paginated list of all payment transactions. Supports sorting and pagination.
- **Query Parameters**:
  - `page` (int, default: 0): The page number.
  - `size` (int, default: 10): The number of records per page.
  - `sortBy` (String, default: "createdAt"): The field to sort the results by.
  - `direction` (String, default: "desc"): The sorting direction (`asc` or `desc`).
- **Response**: `200 OK` with `Page<PaymentResponseModel>` (JSON)

---
