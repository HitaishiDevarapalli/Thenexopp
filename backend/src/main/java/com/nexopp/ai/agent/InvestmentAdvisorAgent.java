package com.nexopp.ai.agent;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class InvestmentAdvisorAgent {

    public Map<String, Object> analyzeInvestment(String city, String propertyType) {
        return Map.of(
            "expectedGrowth", "12-15% p.a.",
            "rentalYield", "5-7% p.a.",
            "riskLevel", "LOW",
            "demandScore", 88
        );
    }
}
