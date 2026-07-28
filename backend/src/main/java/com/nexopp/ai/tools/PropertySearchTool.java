package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class PropertySearchTool {

    public List<?> searchProperties(String city, String propertyType, Double maxPrice) {
        // Intercepts and delegates to backend Property Repository / Service
        return Collections.emptyList();
    }
}
