# PayFlow Integration Protocol Specification

## Overview

This document specifies the communication protocol between the main PayFlow backend and the Integration Service (external payment gateway simulator).

## Architecture

The Integration Service acts as a simulated external payment gateway that:
- Processes top-up requests from the main backend
- Handles withdrawal requests
- Verifies payment status before confirmation
- Simulates realistic failure scenarios (5% random failure rate)
- Adds artificial network latency (200-800ms)

## Authentication

All requests between services use internal API key authentication via the `X-Internal-Key` header.

```
X-Internal-Key: internal-secret-key-for-service-communication
```

The integration service validates this header against a configured secret. Requests without a valid key receive a `403 Forbidden` response.

## Endpoints

### 1. Process Top-Up

Processes a wallet top-up request through the external gateway.

**URL:** `POST /gateway/topup`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: {internal-api-key}
```

**Request Body:**
```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 500000,
  "currency": "IDR",
  "paymentMethod": "VIRTUAL_ACCOUNT",
  "idempotencyKey": "uuid-v4-string"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| walletId | UUID | Yes | Target wallet ID |
| amount | BigDecimal | Yes | Amount to top up |
| currency | String | Yes | Currency code (e.g., "IDR") |
| paymentMethod | String | Yes | Payment method used |
| idempotencyKey | String | Yes | Unique key for idempotency |

**Success Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "gatewayReferenceId": "GW-A1B2C3D4",
  "message": "Gateway processing successful",
  "processedAmount": 500000,
  "currency": "IDR",
  "processedAt": "2024-01-15T10:30:00",
  "errorCode": null,
  "errorMessage": null
}
```

**Failed Response (200 OK with failed status):**
```json
{
  "status": "FAILED",
  "gatewayReferenceId": null,
  "message": "Gateway processing failed: Payment gateway temporarily unavailable",
  "processedAmount": null,
  "currency": null,
  "processedAt": "2024-01-15T10:30:00",
  "errorCode": "GATEWAY_ERROR",
  "errorMessage": "Payment gateway temporarily unavailable"
}
```

### 2. Process Withdrawal

Processes a wallet withdrawal request.

**URL:** `POST /gateway/withdraw`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: {internal-api-key}
```

**Request Body:**
```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 500000,
  "currency": "IDR",
  "destinationAccount": "1234567890",
  "destinationBank": "BCA",
  "idempotencyKey": "uuid-v4-string"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| walletId | UUID | Yes | Source wallet ID |
| amount | BigDecimal | Yes | Amount to withdraw |
| currency | String | Yes | Currency code |
| destinationAccount | String | Yes | Target bank account |
| destinationBank | String | Yes | Target bank name |
| idempotencyKey | String | Yes | Unique key for idempotency |

**Response:** Same format as Top-Up endpoint.

### 3. Verify Payment

Verifies a payment before confirmation.

**URL:** `POST /gateway/verify-payment`

**Headers:**
```
Content-Type: application/json
X-Internal-Key: {internal-api-key}
```

**Request Body:**
```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 500000,
  "currency": "IDR",
  "verificationType": "TOP_UP"
}
```

**Response:** Same format as Top-Up endpoint.

### 4. Health Check

Check if the integration service is available.

**URL:** `GET /gateway/health`

**Response:**
```
200 OK
Body: "UP"
```

## Error Codes

| Code | Description | Recommended Action |
|------|-------------|-------------------|
| GATEWAY_ERROR | Gateway temporarily unavailable | Retry after delay |
| VERIFICATION_FAILED | Payment verification failed | Review payment details |
| INSUFFICIENT_FUNDS | Source has insufficient funds | Request different amount |
| INVALID_ACCOUNT | Invalid destination account | Verify account details |
| TIMEOUT | Request timed out | Retry with timeout handling |

## Simulated Behaviors

The integration service simulates realistic payment gateway behaviors:

1. **Random Failures (5% chance):** Any request has a 5% chance of returning a FAILED status to simulate real-world instability.

2. **Network Latency (200-800ms):** All requests are delayed to simulate network round-trip time.

3. **Verification Speed (100-300ms):** Verification requests are processed faster than transactions.

4. **Idempotency:** Duplicate requests with the same idempotencyKey within 24 hours return the same response.

## Integration Gateway Interface

The main backend uses the `IntegrationGateway` interface to abstract all calls to this service:

```java
public interface IntegrationGateway {
    GatewayResponse processTopUp(GatewayTopUpRequest request);
    GatewayResponse processWithdraw(GatewayWithdrawRequest request);
    GatewayResponse verifyPayment(GatewayVerifyRequest request);
    boolean isHealthy();
}
```

Implementations:
- `HttpIntegrationGateway`: Makes HTTP calls to the integration service
- `MockIntegrationGateway`: For testing without the actual service

## Security Considerations

1. **API Key Rotation:** Internal API keys should be rotated periodically.
2. **Network Isolation:** Integration service should be on an internal network only.
3. **Request Signing:** Consider adding HMAC signatures for additional security.
4. **Rate Limiting:** Implement rate limiting to prevent abuse.

## Example Request Flow

### Top-Up Flow

1. User requests top-up of Rp 100,000
2. Main backend validates request and calls `processTopUp()`
3. Integration service receives request, adds latency, checks failure chance
4. Service returns SUCCESS (95% of the time) or FAILED (5%)
5. Main backend updates wallet balance on SUCCESS
6. Transaction record is updated with gateway reference ID
