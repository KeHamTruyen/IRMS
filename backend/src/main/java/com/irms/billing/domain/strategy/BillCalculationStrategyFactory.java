package com.irms.billing.domain.strategy;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Factory for selecting appropriate bill calculation strategy
 * 
 * OCP: Can add new strategies by:
 * 1. Create new class implementing BillCalculationStrategy
 * 2. Annotate with @Component
 * 3. Set priority with @Order
 * NO modification to this factory needed!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BillCalculationStrategyFactory {
    
    /**
     * Spring automatically injects ALL BillCalculationStrategy beans
     * ✅ OCP: New strategies are auto-discovered!
     */
    private final List<BillCalculationStrategy> strategies;
    
    /**
     * Select the most appropriate strategy for the given context
     * 
     * Strategies are checked in priority order (lowest @Order value first)
     * First strategy that matches (appliesTo returns true) is selected
     * 
     * @param context Calculation context
     * @return Selected strategy
     */
    public BillCalculationStrategy selectStrategy(BillCalculationContext context) {
        // Sort strategies by priority (@Order annotation)
        List<BillCalculationStrategy> sortedStrategies = strategies.stream()
                .sorted(Comparator.comparing(s -> {
                    org.springframework.core.annotation.Order order = 
                        s.getClass().getAnnotation(org.springframework.core.annotation.Order.class);
                    return order != null ? order.value() : 999;
                }))
                .toList();
        
        // Find first matching strategy
        BillCalculationStrategy selected = sortedStrategies.stream()
                .filter(strategy -> strategy.appliesTo(context))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                    "No bill calculation strategy found for context: " + context
                ));
        
        log.info("Selected bill calculation strategy: {}", selected.getStrategyName());
        return selected;
    }
    
    /**
     * Get strategy by name (for testing or explicit selection)
     * 
     * @param strategyName Strategy name
     * @return Strategy
     */
    public BillCalculationStrategy getStrategyByName(String strategyName) {
        return strategies.stream()
                .filter(s -> s.getStrategyName().equalsIgnoreCase(strategyName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                    "No strategy found with name: " + strategyName
                ));
    }
    
    /**
     * Get all available strategies
     * 
     * @return List of all strategies
     */
    public List<BillCalculationStrategy> getAllStrategies() {
        return List.copyOf(strategies);
    }
}
