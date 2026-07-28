package com.nexopp.ai.agent;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PlannerAgent {

    private final PropertySearchAgent propertySearchAgent;
    private final InvestmentAdvisorAgent investmentAdvisorAgent;

    @Autowired
    public PlannerAgent(PropertySearchAgent propertySearchAgent, InvestmentAdvisorAgent investmentAdvisorAgent) {
        this.propertySearchAgent = propertySearchAgent;
        this.investmentAdvisorAgent = investmentAdvisorAgent;
    }

    public Map<String, Object> planAndExecute(String query, String city, String type, Double maxPrice) {
        List<?> listings = propertySearchAgent.executeSearch(city, type, maxPrice);
        Map<String, Object> investmentReport = investmentAdvisorAgent.analyzeInvestment(city, type);

        return Map.of(
            "listings", listings,
            "investmentReport", investmentReport,
            "status", "COMPLETED"
        );
    }
}
