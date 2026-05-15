package com.payflow.gateway;

import com.payflow.dto.request.GatewayTopUpRequest;
import com.payflow.dto.request.GatewayWithdrawRequest;
import com.payflow.dto.request.GatewayVerifyRequest;
import com.payflow.dto.response.GatewayResponse;

/**
 * IntegrationGateway - Interface demonstrating ABSTRACTION (OOP Pillar #4)
 * 
 * This is an ABSTRACTION that defines the contract for communicating
 * with external payment gateways. The main backend uses this interface
 * without knowing the implementation details.
 * 
 * HttpIntegrationGateway is the concrete implementation that makes
 * HTTP calls to the integration-service.
 * 
 * This abstraction allows:
 * - Easy swapping of gateway implementations
 * - Mocking for testing
 * - Adding retry logic, circuit breakers without changing business logic
 */
public interface IntegrationGateway {

    /**
     * Process a top-up request through the gateway.
     * 
     * @param request The top-up request details
     * @return The gateway response with status and reference
     */
    GatewayResponse processTopUp(GatewayTopUpRequest request);

    /**
     * Process a withdrawal request through the gateway.
     * 
     * @param request The withdrawal request details
     * @return The gateway response with status and reference
     */
    GatewayResponse processWithdraw(GatewayWithdrawRequest request);

    /**
     * Verify a payment before confirming it.
     * 
     * @param request The verification request
     * @return The verification response
     */
    GatewayResponse verifyPayment(GatewayVerifyRequest request);

    /**
     * Check if the integration service is healthy.
     * 
     * @return true if service is available
     */
    boolean isHealthy();
}
