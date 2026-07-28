package com.nexopp.service.impl;

import com.nexopp.dto.AiChatRequest;
import com.nexopp.dto.AiChatResponse;
import com.nexopp.service.AiOrchestratorService;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AiOrchestratorServiceImpl implements AiOrchestratorService {

    @Override
    public AiChatResponse processChatQuery(AiChatRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase() : "";

        // Intent Classification & Service Orchestration Pipeline
        if (query.contains("emi") || query.contains("loan")) {
            return new AiChatResponse(
                "💰 Instant Home Loan EMI Calculator: Interest rates start at 8.5% p.a.",
                "EMI_CALCULATION",
                98.0,
                "calculateEMI()",
                Collections.emptyList()
            );
        }

        if (query.contains("franchise")) {
            return new AiChatResponse(
                "🏢 Navigating to Verified Franchise Opportunities across AP & Telangana.",
                "FRANCHISE_SEARCH",
                95.0,
                "searchFranchises()",
                Collections.emptyList()
            );
        }

        if (query.contains("business")) {
            return new AiChatResponse(
                "💼 Found Operational Commercial Businesses for sale/takeover.",
                "BUSINESS_SEARCH",
                95.0,
                "searchBusinesses()",
                Collections.emptyList()
            );
        }

        // Default Property Search Orchestration
        return new AiChatResponse(
            "I found verified properties matching your requirements:",
            "PROPERTY_SEARCH",
            95.0,
            "searchProperties()",
            Collections.emptyList()
        );
    }
}
