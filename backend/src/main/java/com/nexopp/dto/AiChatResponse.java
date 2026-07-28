package com.nexopp.dto;

import java.util.List;

public class AiChatResponse {
    private String reply;
    private String intent;
    private double confidenceScore;
    private String toolExecuted;
    private List<?> results;

    public AiChatResponse() {}

    public AiChatResponse(String reply, String intent, double confidenceScore, String toolExecuted, List<?> results) {
        this.reply = reply;
        this.intent = intent;
        this.confidenceScore = confidenceScore;
        this.toolExecuted = toolExecuted;
        this.results = results;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getToolExecuted() { return toolExecuted; }
    public void setToolExecuted(String toolExecuted) { this.toolExecuted = toolExecuted; }

    public List<?> getResults() { return results; }
    public void setResults(List<?> results) { this.results = results; }
}
