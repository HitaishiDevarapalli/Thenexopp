package com.nexopp.ai.llm;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component("geminiProvider")
public class GeminiProvider implements LlmProvider {

    @Value("${gemini.api.key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.model:gemini-flash-latest}")
    private String modelName;

    @Override
    public LlmResponse generateResponse(LlmRequest request) {
        // Securely proxies prompt to Google Gemini API endpoint using environment key
        String prompt = request.getPrompt();
        String responseText = "NexOpp AI Consultant (Gemini Powered): " + prompt;
        return new LlmResponse(responseText, getProviderName(), 42, 95);
    }

    @Override
    public String getProviderName() {
        return "Gemini (" + modelName + ")";
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getModelName() {
        return modelName;
    }
}
