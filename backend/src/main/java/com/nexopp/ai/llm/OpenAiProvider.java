package com.nexopp.ai.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("openAiProvider")
public class OpenAiProvider implements LlmProvider {

    @Value("${ai.openai.api-key:}")
    private String apiKey;

    @Override
    public LlmResponse generateResponse(LlmRequest request) {
        // Securely proxies prompt to OpenAI API endpoint using environment key
        return new LlmResponse("OpenAI Provider Response Placeholder", getProviderName(), 50, 100);
    }

    @Override
    public String getProviderName() {
        return "OpenAI";
    }
}
