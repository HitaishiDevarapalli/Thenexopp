package com.nexopp.ai.memory;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ConversationMemory {

    private final Map<String, Map<String, Object>> sessionStore = new ConcurrentHashMap<>();

    public void updateSession(String conversationId, String key, Object value) {
        sessionStore.computeIfAbsent(conversationId, k -> new ConcurrentHashMap<>()).put(key, value);
    }

    public Object getSessionAttribute(String conversationId, String key) {
        Map<String, Object> session = sessionStore.get(conversationId);
        return session != null ? session.get(key) : null;
    }

    public void clearSession(String conversationId) {
        sessionStore.remove(conversationId);
    }
}
