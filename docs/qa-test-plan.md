# PayFlow QA Test Plan

## Test Scope and Objectives

This test plan covers functional, security, and edge case testing for the PayFlow digital payment platform.

## Test Environment

- **Backend API:** http://localhost:8080
- **Integration Service:** http://localhost:8081
- **Frontend:** http://localhost:3000
- **Database:** PostgreSQL 15
- **Test Database:** H2 In-Memory (for integration tests)

### Setup Instructions
1. Start PostgreSQL container
2. Run `docker-compose up`
3. Execute migrations with `mvn flyway:migrate`
4. Start backend: `cd backend && mvn spring-boot:run`
5. Start integration service: `cd integration-service && mvn spring-boot:run`
6. Start frontend: `cd frontend && npm run dev`

---

## Test Categories

### 1. Authentication & Registration (Tests 1-10)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| AUTH-001 | User Registration - Success | High | Clean database | 1. POST /api/auth/register with valid data<br>2. Verify response | 200 OK with accessToken, refreshToken, user data |
| AUTH-002 | Registration - Duplicate Username | High | User exists | 1. Register user<br>2. Attempt duplicate registration | 409 Conflict with error message |
| AUTH-003 | Registration - Duplicate Email | High | User exists | 1. Register user<br>2. Try same email, different username | 409 Conflict with error message |
| AUTH-004 | Registration - Invalid Password | Medium | N/A | 1. POST with password "123" | 400 Bad Request - password validation error |
| AUTH-005 | Registration - Missing Required Fields | Medium | N/A | 1. POST with empty body | 400 Bad Request - validation errors |
| AUTH-006 | Login - Success | High | Registered user | 1. POST /api/auth/login with valid credentials | 200 OK with tokens |
| AUTH-007 | Login - Wrong Password | High | Registered user | 1. POST with wrong password | 401 Unauthorized |
| AUTH-008 | Login - Non-existent User | High | N/A | 1. POST with unknown username | 401 Unauthorized |
| AUTH-009 | Token Refresh | High | Valid refresh token | 1. POST /api/auth/refresh | 200 OK with new tokens, old token revoked |
| AUTH-010 | Rate Limiting - Login | High | N/A | 1. Attempt 6 failed logins rapidly | 429 Too Many Requests on 6th attempt |

### 2. PIN Management (Tests 11-15)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| PIN-001 | PIN Setup - Success | High | User without PIN | 1. POST /api/auth/setup-pin with matching 6-digit PINs | 200 OK, user.hasPin = true |
| PIN-002 | PIN Setup - Mismatch | High | N/A | 1. POST with different PIN and confirmPIN | 400 Bad Request - PINs don't match |
| PIN-003 | PIN Setup - Already Set | Medium | User with PIN | 1. Attempt setup for user with existing PIN | 400 Bad Request - PIN already set |
| PIN-004 | PIN Verification - Success | High | User with PIN | 1. POST /api/auth/verify-pin with correct PIN | 200 OK, returns true |
| PIN-005 | PIN Verification - Wrong PIN | High | User with PIN | 1. POST with incorrect PIN | 200 OK, returns false |

### 3. Wallet Operations (Tests 16-25)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| WAL-001 | Wallet Creation on Register | High | New user | 1. Register new user<br>2. Check wallet created | Wallet exists with 0 balance |
| WAL-002 | Get Balance | High | Authenticated user | 1. GET /api/wallet/balance | 200 OK with balance amount |
| WAL-003 | Generate QR Code | Medium | Authenticated user | 1. GET /api/wallet/qr-code | 200 OK with wallet ID string |
| WAL-004 | Credit Operation | High | Valid wallet | 1. Call wallet.credit(100000) | Balance increased by 100000 |
| WAL-005 | Debit Operation - Success | High | Sufficient balance | 1. Call wallet.debit(50000) | Balance decreased by 50000 |
| WAL-006 | Debit - Insufficient Funds | High | Low balance | 1. Attempt debit exceeding balance | IllegalStateException thrown |
| WAL-007 | Balance Encapsulation | Critical | N/A | 1. Try direct balance field access | Field is private, no setter |
| WAL-008 | Wallet Balance Caching | Medium | Multiple reads | 1. Read balance twice | Second read served from cache |
| WAL-009 | QR Code Contains Wallet ID | High | Wallet exists | 1. Generate QR<br>2. Decode value | Value equals wallet ID |
| WAL-010 | Max Balance Limit | Medium | Large credit | 1. Attempt credit > 500B | IllegalArgumentException |

### 4. Transactions - Top-Up (Tests 26-32)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| TX-001 | Top-Up - Success | High | Valid PIN, auth | 1. POST /api/transactions/topup<br>2. Gateway returns SUCCESS | Transaction COMPLETED, balance updated |
| TX-002 | Top-Up - Gateway Failure | High | Valid PIN, auth | 1. POST top-up<br>2. Gateway returns FAILED (simulate) | Transaction FAILED, no balance change |
| TX-003 | Top-Up - Invalid PIN | High | Authenticated | 1. POST with wrong PIN | 400 Bad Request - Invalid PIN |
| TX-004 | Top-Up - Max Amount | Medium | Authenticated | 1. Attempt top-up > 50M | 400 Bad Request - Amount validation |
| TX-005 | Top-Up - Negative Amount | Low | Authenticated | 1. POST with negative amount | 400 Bad Request |
| TX-006 | Top-Up - Zero Amount | Low | Authenticated | 1. POST with amount 0 | 400 Bad Request |
| TX-007 | Top-Up Idempotency | Medium | Same idempotency key | 1. Send duplicate request | Same response, single transaction |

### 5. Transactions - Transfer (Tests 33-40)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| TX-008 | Transfer - Success | High | Sufficient balance, PIN | 1. POST /api/transactions/transfer | Both wallets updated, notifications sent |
| TX-009 | Transfer - Insufficient Funds | High | Low balance | 1. Attempt transfer > balance | 400 Bad Request - Insufficient balance |
| TX-010 | Transfer - Invalid PIN | High | Valid transfer | 1. POST with wrong PIN | 400 Bad Request - Invalid PIN |
| TX-011 | Transfer - Self-Transfer | Medium | Same wallet | 1. Transfer to own wallet | PaymentResult failure - Self transfer |
| TX-012 | Transfer - Recipient Not Found | High | Valid auth | 1. Transfer to non-existent user | 404 Not Found |
| TX-013 | Transfer - Max Amount | Medium | Sufficient balance | 1. Attempt transfer > 50M | 400 Bad Request |
| TX-014 | Transfer - Fee Calculation | Medium | Amount <= 100k | 1. Transfer 50000 | Fee = 1000 |
| TX-015 | Transfer - Free Above 100k | Medium | Amount > 100k | 1. Transfer 200000 | Fee = 0 |

### 6. Bill Payments (Tests 41-45)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| BILL-001 | Bill Payment - Fixed Amount | High | Valid bill type | 1. POST /api/transactions/pay-bill | Amount matches bill fixed amount |
| BILL-002 | Bill Payment - Variable Amount | High | Valid bill type | 1. POST with custom amount | Transaction uses provided amount |
| BILL-003 | Bill Payment - Fee Applied | Medium | Any bill | 1. Pay bill | Fee = 1% of amount, max 5000 |
| BILL-004 | Bill Payment - Invalid Customer ID | High | Valid auth | 1. POST with empty customerId | 400 Bad Request |
| BILL-005 | Inactive Bill Type | Low | Bill deactivated | 1. Attempt payment to inactive bill | 400 Bad Request - Bill inactive |

### 7. QR Payments (Tests 46-48)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| QR-001 | QR Payment - Success | High | Valid QR, PIN | 1. Scan valid QR code<br>2. Confirm payment | Transfer completed |
| QR-002 | QR Generation | Medium | Authenticated | 1. GET /api/wallet/qr-code | Returns valid wallet ID |
| QR-003 | Invalid QR Code | High | N/A | 1. Scan invalid/random QR | Error - Invalid QR code |

### 8. Transaction History (Tests 49-52)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| HIST-001 | Get Transaction History | High | Has transactions | 1. GET /api/transactions | Paginated list with metadata |
| HIST-002 | Filter by Type | Medium | Mixed transactions | 1. GET with type=TRANSFER | Only TRANSFER type returned |
| HIST-003 | Date Range Filter | Medium | Transactions exist | 1. GET with startDate and endDate | Transactions in range only |
| HIST-004 | Pagination | Medium | Many transactions | 1. GET page=1, size=10 | Correct page returned |

### 9. Notifications (Tests 53-57)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| NOTIF-001 | Transaction Notification | High | Completed transaction | 1. Complete transfer | Notification created for both parties |
| NOTIF-002 | Get Notifications | High | Has notifications | 1. GET /api/notifications | List of notifications |
| NOTIF-003 | Mark as Read | Medium | Unread notification | 1. PATCH /api/notifications/{id}/read | Notification marked read |
| NOTIF-004 | Mark All as Read | Medium | Multiple unread | 1. PATCH /api/notifications/read-all | All notifications marked read |
| NOTIF-005 | Unread Count | Medium | Mixed read status | 1. GET /api/notifications/count-unread | Correct count returned |

### 10. Admin Access Control (Tests 58-62)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| ADMIN-001 | Admin Endpoint - Admin User | High | ROLE_ADMIN user | 1. GET /api/admin/users | 200 OK with user list |
| ADMIN-002 | Admin Endpoint - Regular User | Critical | ROLE_USER | 1. GET /api/admin/users | 403 Forbidden |
| ADMIN-003 | Admin Analytics | High | Admin user | 1. GET /api/admin/analytics/summary | Stats returned |
| ADMIN-004 | Admin Daily Volume | Medium | Admin user | 1. GET /api/admin/analytics/daily-volume | Chart data returned |
| ADMIN-005 | Default Admin Credentials | High | Fresh database | 1. Check seeded admin | Admin exists with credentials |

### 11. JWT Security (Tests 63-67)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| JWT-001 | Access Token Expiry | High | Valid token | 1. Wait 15 minutes<br>2. Use token | 401 Unauthorized |
| JWT-002 | Refresh Token Rotation | High | Valid refresh token | 1. POST /api/auth/refresh | New tokens issued, old refresh revoked |
| JWT-003 | Token Invalid Signature | Critical | Modified token | 1. Send tampered token | 401 Unauthorized |
| JWT-004 | Missing Token | Critical | N/A | 1. Call protected endpoint | 401 Unauthorized |
| JWT-005 | Logout Revokes Refresh | High | Valid refresh | 1. POST /api/auth/logout<br>2. Try refresh | 401 Unauthorized |

### 12. Edge Cases & Negative Testing (Tests 68-75)

| ID | Feature | Priority | Preconditions | Test Steps | Expected Result |
|----|---------|----------|---------------|------------|-----------------|
| EDGE-001 | SQL Injection Attempt | Critical | N/A | 1. Input SQL in username field | Input sanitized, no injection |
| EDGE-002 | XSS Attempt | Critical | N/A | 1. Input script tags in fields | Output encoded, no execution |
| EDGE-003 | Very Long Input | Medium | N/A | 1. Input 1000+ character strings | Validation rejects or truncates |
| EDGE-004 | Special Characters | Low | N/A | 1. Use emoji in description | Accepted and stored correctly |
| EDGE-005 | Concurrent Transfers | High | Same wallet | 1. Two simultaneous transfers | Race condition handled, balances correct |
| EDGE-006 | Decimal Amount Precision | Medium | N/A | 1. Transfer 10000.999 | 400 Bad Request - max 2 decimals |
| EDGE-007 | Empty Request Body | Low | N/A | 1. POST with empty body | 400 Bad Request |
| EDGE-008 | Malformed JSON | Low | N/A | 1. Send invalid JSON | 400 Bad Request |

---

## Test Execution Schedule

### Phase 1: Unit Tests (Days 1-2)
- AUTH-001 to AUTH-010
- PIN-001 to PIN-005
- WAL-001 to WAL-010

### Phase 2: Integration Tests (Days 3-4)
- TX-001 to TX-015
- BILL-001 to BILL-005
- QR-001 to QR-003

### Phase 3: Security & Edge Cases (Day 5)
- JWT-001 to JWT-005
- ADMIN-001 to ADMIN-005
- EDGE-001 to EDGE-008

### Phase 4: E2E Frontend Tests (Day 6)
- Complete user flows
- Mobile responsiveness
- Cross-browser testing

## Pass/Fail Criteria

- **Pass:** All High priority tests pass
- **Conditional Pass:** Up to 2 Medium priority tests may fail with documented workarounds
- **Fail:** Any Critical security test fails, or >20% of tests fail

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |
