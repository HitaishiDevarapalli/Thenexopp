package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class FinanceInsuranceTool {

    public Map<String, Object> searchFinanceOptions(String loanType) {
        return Map.of(
            "startingRate", "8.5% p.a.",
            "maxTenure", "30 Years",
            "processingFee", "Zero for select partner builders"
        );
    }

    public Map<String, Object> searchInsuranceOptions(String coverageType) {
        return Map.of(
            "coverage", "Structure & Home Contents",
            "claimsRatio", "98.5%",
            "partnerProviders", "HDFC ERGO, ICICI Lombard"
        );
    }
}
