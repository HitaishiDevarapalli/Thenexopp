package com.nexopp.ai.orchestrator;

import com.nexopp.ai.dto.ChatRequest;
import com.nexopp.ai.dto.ChatResponse;
import com.nexopp.ai.tools.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
public class AiOrchestrator {

    private final PropertySearchTool propertySearchTool;
    private final EmiTool emiTool;
    private final BusinessSearchTool businessSearchTool;
    private final FranchiseSearchTool franchiseSearchTool;
    private final BookingTool bookingTool;
    private final FinanceInsuranceTool financeInsuranceTool;
    private final ContentSearchTool contentSearchTool;

    @Autowired
    public AiOrchestrator(PropertySearchTool propertySearchTool,
                          EmiTool emiTool,
                          BusinessSearchTool businessSearchTool,
                          FranchiseSearchTool franchiseSearchTool,
                          BookingTool bookingTool,
                          FinanceInsuranceTool financeInsuranceTool,
                          ContentSearchTool contentSearchTool) {
        this.propertySearchTool = propertySearchTool;
        this.emiTool = emiTool;
        this.businessSearchTool = businessSearchTool;
        this.franchiseSearchTool = franchiseSearchTool;
        this.bookingTool = bookingTool;
        this.financeInsuranceTool = financeInsuranceTool;
        this.contentSearchTool = contentSearchTool;
    }

    public ChatResponse processPrompt(ChatRequest request) {
        String query = request.getQuery() != null ? request.getQuery().toLowerCase() : "";
        String convId = request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString();

        if (query.contains("emi") || query.contains("loan")) {
            return new ChatResponse(
                "💰 Instant Home Loan EMI Calculator: Rates starting at 8.5% p.a.",
                "EMI_CALCULATION",
                98.0,
                "calculateEMI()",
                convId,
                Collections.emptyList()
            );
        }

        if (query.contains("franchise")) {
            return new ChatResponse(
                "🏢 Navigating to Verified Franchise Opportunities across AP & Telangana.",
                "FRANCHISE_SEARCH",
                95.0,
                "searchFranchises()",
                convId,
                Collections.emptyList()
            );
        }

        if (query.contains("business")) {
            return new ChatResponse(
                "💼 Found Operational Commercial Businesses for sale/takeover.",
                "BUSINESS_SEARCH",
                95.0,
                "searchBusinesses()",
                convId,
                Collections.emptyList()
            );
        }

        if (query.contains("visit") || query.contains("book")) {
            return new ChatResponse(
                "📅 I can help you schedule a verified site visit with our local consultant.",
                "SITE_VISIT_BOOKING",
                95.0,
                "bookSiteVisit()",
                convId,
                Collections.emptyList()
            );
        }

        if (query.contains("insurance")) {
            return new ChatResponse(
                "🛡️ Property Insurance: Complete structure & content coverage with 98.5% claim settlement ratio.",
                "INSURANCE_SEARCH",
                95.0,
                "searchInsurance()",
                convId,
                Collections.emptyList()
            );
        }

        return new ChatResponse(
            "I found verified properties matching your requirements:",
            "PROPERTY_SEARCH",
            95.0,
            "searchProperties()",
            convId,
            Collections.emptyList()
        );
    }
}
