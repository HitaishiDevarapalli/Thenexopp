package com.nexopp.dto;

import java.util.List;

public class AiChatRequest {
    private String query;
    private String city;
    private String category;
    private Double maxPrice;
    private String language;

    public AiChatRequest() {}

    public AiChatRequest(String query, String city, String category, Double maxPrice, String language) {
        this.query = query;
        this.city = city;
        this.category = category;
        this.maxPrice = maxPrice;
        this.language = language;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getMaxPrice() { return maxPrice; }
    public void setMaxPrice(Double maxPrice) { this.maxPrice = maxPrice; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
