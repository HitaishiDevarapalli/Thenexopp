# TheNexopp Agent - API & WebSocket Documentation

## Base Information
- **Production Base URL**: `https://api.thenexopp.com/api/v1`
- **Development Base URL**: `http://localhost:3000/api/v1` (or `http://10.0.2.2:3000/api/v1` in Android Emulator)
- **OpenAPI Interactive UI**: `https://api.thenexopp.com/api/docs`
- **WebSocket Gateway**: `wss://api.thenexopp.com/ws`

---

## Standard Error Format
All endpoints return a uniform error object:
```json
{
  "success": false,
  "code": "KYC_REJECTED",
  "message": "Your KYC document verification failed.",
  "details": {}
}
```

---

## Authentication Endpoints

### 1. Send OTP
- **POST** `/auth/send-otp`
- **Rate Limit**: 2 requests per minute per IP.
- **Request**:
  ```json
  { "mobileNumber": "9876543210" }
  ```
- **Response (200 OK)**:
  ```json
  { "success": true, "message": "OTP sent successfully", "cooldownSeconds": 60 }
  ```

### 2. Verify OTP & Authenticate
- **POST** `/auth/verify-otp`
- **Request**:
  ```json
  { "mobileNumber": "9876543210", "otp": "123456", "deviceId": "Android-Pixel-123" }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "7f8a...",
      "agentState": "APPROVED",
      "user": { "id": "uuid", "agentId": "uuid", "mobileNumber": "9876543210", "role": "AGENT" }
    }
  }
  ```

### 3. Refresh Access Token
- **POST** `/auth/refresh`
- **Request**: `{ "refreshToken": "7f8a..." }`

---

## Agent & Onboarding Endpoints (Bearer Auth)

### 4. Get Agent Profile & Status
- **GET** `/agent/profile`

### 5. Update Profile
- **PUT** `/agent/profile`
- **Request**:
  ```json
  {
    "fullName": "Rajesh Kumar",
    "areaLocation": "Koramangala, Bengaluru",
    "age": 28,
    "gender": "Male",
    "workPlatform": "Swiggy"
  }
  ```

### 6. Submit KYC Documents
- **POST** `/agent/kyc`
- **Request**:
  ```json
  {
    "aadhaarNumber": "123456789012",
    "panNumber": "ABCDE1234F",
    "aadhaarDocKey": "private-kyc/aadhaar-123.jpg",
    "panDocKey": "private-kyc/pan-123.jpg"
  }
  ```

### 7. Submit Bank & UPI Details
- **POST** `/agent/bank-details`
- **Request**:
  ```json
  {
    "accountNumber": "918234567890",
    "confirmAccountNumber": "918234567890",
    "ifscCode": "SBIN0001234",
    "upiId": "rajesh@upi"
  }
  ```

---

## Properties Endpoints

### 8. List Agent Properties
- **GET** `/properties?status=APPROVED`

### 9. Create Property
- **POST** `/properties`
- **Request**:
  ```json
  {
    "title": "3BHK Villa in Whitefield",
    "description": "Luxury 3BHK villa with private lawn.",
    "price": 8500000,
    "category": "RESIDENTIAL_SALE",
    "location": "Whitefield, Bengaluru",
    "imageKeys": ["property-images/photo1.jpg"],
    "isDraft": false
  }
  ```

---

## WebSocket Events (`/ws`)
- Connect with header: `Authorization: Bearer <accessToken>`
- Subscribed Events:
  - `agent.status.updated` -> Payload: `{ status: "APPROVED", rejectionReason: null }`
  - `kyc.status.updated` -> Payload: `{ status: "APPROVED" }`
  - `property.status.updated` -> Payload: `{ propertyId: "uuid", status: "APPROVED" }`
  - `payment.created` -> Payload: `{ paymentId: "uuid", amount: 7500, transactionId: "TXN123" }`
