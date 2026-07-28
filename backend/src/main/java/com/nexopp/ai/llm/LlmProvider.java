package com.nexopp.ai.llm;

public interface LlmProvider {
    LlmResponse generateResponse(LlmRequest request);
    String getProviderName();
}
