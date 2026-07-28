package com.nexopp.service;

import com.nexopp.dto.AiChatRequest;
import com.nexopp.dto.AiChatResponse;

public interface AiOrchestratorService {
    AiChatResponse processChatQuery(AiChatRequest request);
}
