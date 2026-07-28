package com.nexopp.ai.llm;

public class LlmResponse {
    private String content;
    private String providerName;
    private int promptTokens;
    private int completionTokens;

    public LlmResponse() {}

    public LlmResponse(String content, String providerName, int promptTokens, int completionTokens) {
        this.content = content;
        this.providerName = providerName;
        this.promptTokens = promptTokens;
        this.completionTokens = completionTokens;
    }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public int getPromptTokens() { return promptTokens; }
    public void setPromptTokens(int promptTokens) { this.promptTokens = promptTokens; }

    public int getCompletionTokens() { return completionTokens; }
    public void setCompletionTokens(int completionTokens) { this.completionTokens = completionTokens; }
}
