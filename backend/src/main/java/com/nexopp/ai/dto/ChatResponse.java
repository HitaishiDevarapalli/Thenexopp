package com.nexopp.ai.dto;

import java.util.List;

public class ChatResponse {
    private String reply;
    private String intent;
    private double confidenceScore;
    private String toolExecuted;
    private String conversationId;
    private List<?> items;

    public ChatResponse() {}

    public ChatResponse(String reply, String intent, double confidenceScore, String toolExecuted, String conversationId, List<?> items) {
        this.reply = reply;
        this.intent = intent;
        this.confidenceScore = confidenceScore;
        this.toolExecuted = toolExecuted;
        this.conversationId = conversationId;
        this.items = items;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getToolExecuted() { return toolExecuted; }
    public void setToolExecuted(String toolExecuted) { this.toolExecuted = toolExecuted; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public List<?> getItems() { return items; }
    public void setItems(List<?> items) { this.items = items; }
}
