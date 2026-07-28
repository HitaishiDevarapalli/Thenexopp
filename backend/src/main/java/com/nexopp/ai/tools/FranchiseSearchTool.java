package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class FranchiseSearchTool {

    public List<?> searchFranchises(String category, Double maxInvestment) {
        // Delegates to live Franchise Listing Repository / Service
        return Collections.emptyList();
    }
}
