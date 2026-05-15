package com.payflow.gateway;

import com.payflow.dto.request.GatewayTopUpRequest;
import com.payflow.dto.request.GatewayVerifyRequest;
import com.payflow.dto.request.GatewayWithdrawRequest;
import com.payflow.dto.response.GatewayResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HttpIntegrationGateway - Concrete implementation of IntegrationGateway.
 * 
 * Makes HTTP REST calls to the integration-service (external gateway simulator).
 * 
 * ABSTRACTION: Implements IntegrationGateway interface, hiding HTTP details
 * from the service layer.
 */
@Component
public class HttpIntegrationGateway implements IntegrationGateway {

    private static final Logger logger = LoggerFactory.getLogger(HttpIntegrationGateway.class);

    private final RestTemplate restTemplate;
    private final String integrationServiceUrl;
    private final String internalApiKey;

    public HttpIntegrationGateway(
            @Value("${integration.service.url:http://localhost:8081}") String integrationServiceUrl,
            @Value("${internal.api.key:internal-secret-key}") String internalApiKey) {
        this.restTemplate = new RestTemplate();
        this.integrationServiceUrl = integrationServiceUrl;
        this.internalApiKey = internalApiKey;
    }

    @Override
    public GatewayResponse processTopUp(GatewayTopUpRequest request) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<GatewayTopUpRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<GatewayResponse> response = restTemplate.exchange(
                    integrationServiceUrl + "/gateway/topup",
                    HttpMethod.POST,
                    entity,
                    GatewayResponse.class
            );

            logger.info("Top-up gateway response: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error calling gateway for top-up: {}", e.getMessage());
            return GatewayResponse.failed("GATEWAY_ERROR", e.getMessage());
        }
    }

    @Override
    public GatewayResponse processWithdraw(GatewayWithdrawRequest request) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<GatewayWithdrawRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<GatewayResponse> response = restTemplate.exchange(
                    integrationServiceUrl + "/gateway/withdraw",
                    HttpMethod.POST,
                    entity,
                    GatewayResponse.class
            );

            logger.info("Withdraw gateway response: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error calling gateway for withdraw: {}", e.getMessage());
            return GatewayResponse.failed("GATEWAY_ERROR", e.getMessage());
        }
    }

    @Override
    public GatewayResponse verifyPayment(GatewayVerifyRequest request) {
        try {
            HttpHeaders headers = createHeaders();
            HttpEntity<GatewayVerifyRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<GatewayResponse> response = restTemplate.exchange(
                    integrationServiceUrl + "/gateway/verify-payment",
                    HttpMethod.POST,
                    entity,
                    GatewayResponse.class
            );

            logger.info("Verify payment gateway response: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error calling gateway for verification: {}", e.getMessage());
            return GatewayResponse.failed("GATEWAY_ERROR", e.getMessage());
        }
    }

    @Override
    public boolean isHealthy() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    integrationServiceUrl + "/gateway/health",
                    String.class
            );
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            logger.warn("Integration service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Create HTTP headers with internal API key for service-to-service authentication.
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Key", internalApiKey);
        headers.set("Content-Type", "application/json");
        return headers;
    }
}
