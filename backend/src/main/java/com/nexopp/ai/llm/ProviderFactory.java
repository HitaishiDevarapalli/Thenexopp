package com.nexopp.ai.llm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProviderFactory {

    private final Map<String, LlmProvider> providers;

    @Value("${ai.provider.default:openAiProvider}")
    private String defaultProviderName;

    @Autowired
    public ProviderFactory(Map<String, LlmProvider> providers) {
        this.providers = providers;
    }

    public LlmProvider getProvider(String providerName) {
        if (providerName != null && providers.containsKey(providerName)) {
            return providers.get(providerName);
        }
        return providers.getOrDefault(defaultProviderName, providers.values().iterator().next());
    }
}
