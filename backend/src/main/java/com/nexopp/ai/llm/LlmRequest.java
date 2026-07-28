package com.nexopp.ai.llm;

public class LlmRequest {
    private String prompt;
    private String systemPrompt;
    private double temperature = 0.7;
    private int maxTokens = 800;

    public LlmRequest() {}

    public LlmRequest(String prompt, String systemPrompt) {
        this.prompt = prompt;
        this.systemPrompt = systemPrompt;
    }

    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
}
