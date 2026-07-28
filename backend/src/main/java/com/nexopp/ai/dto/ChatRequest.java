package com.nexopp.ai.dto;

public class ChatRequest {
    private String query;
    private String conversationId;
    private String city;
    private String propertyType;
    private Double maxPrice;
    private String language;

    public ChatRequest() {}

    public ChatRequest(String query, String conversationId, String city, String propertyType, Double maxPrice, String language) {
        this.query = query;
        this.conversationId = conversationId;
        this.city = city;
        this.propertyType = propertyType;
        this.maxPrice = maxPrice;
        this.language = language;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
