package com.nexopp.ai.agent;

import com.nexopp.ai.tools.PropertySearchTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PropertySearchAgent {

    private final PropertySearchTool propertySearchTool;

    @Autowired
    public PropertySearchAgent(PropertySearchTool propertySearchTool) {
        this.propertySearchTool = propertySearchTool;
    }

    public List<?> executeSearch(String city, String propertyType, Double maxPrice) {
        return propertySearchTool.searchProperties(city, propertyType, maxPrice);
    }
}
