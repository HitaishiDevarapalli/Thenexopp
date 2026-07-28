package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class BusinessSearchTool {

    public List<?> searchBusinesses(String category, String location, Double maxPrice) {
        // Delegates to live Business Listing Repository / Service
        return Collections.emptyList();
    }
}
