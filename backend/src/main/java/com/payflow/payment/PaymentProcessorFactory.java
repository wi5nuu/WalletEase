package com.payflow.payment;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PaymentProcessorFactory - Factory pattern demonstrating POLYMORPHISM (OOP Pillar #3)
 * 
 * This factory resolves the correct PaymentProcessor implementation at runtime
 * based on the PaymentType enum value.
 * 
 * Uses Spring's dependency injection to collect all PaymentProcessor implementations
 * and map them by their supported type.
 */
@Component
public class PaymentProcessorFactory {

    private final Map<PaymentProcessor.PaymentType, PaymentProcessor> processors;

    /**
     * Constructor injection of all PaymentProcessor implementations.
     * Spring collects all beans implementing PaymentProcessor into the list.
     * 
     * POLYMORPHISM: List<PaymentProcessor> contains different concrete implementations
     */
    public PaymentProcessorFactory(List<PaymentProcessor> processorList) {
        this.processors = new HashMap<>();
        for (PaymentProcessor processor : processorList) {
            processors.put(processor.getType(), processor);
        }
    }

    /**
     * Get the appropriate processor for the given payment type.
     * 
     * @param type The payment type
     * @return The matching processor
     * @throws IllegalArgumentException if no processor found for type
     */
    public PaymentProcessor getProcessor(PaymentProcessor.PaymentType type) {
        PaymentProcessor processor = processors.get(type);
        if (processor == null) {
            throw new IllegalArgumentException("No processor found for type: " + type);
        }
        return processor;
    }

    /**
     * Check if a processor exists for the given type.
     * 
     * @param type The payment type
     * @return true if processor exists
     */
    public boolean hasProcessor(PaymentProcessor.PaymentType type) {
        return processors.containsKey(type);
    }
}
