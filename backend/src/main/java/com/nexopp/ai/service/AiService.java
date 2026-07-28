package com.nexopp.ai.service;

import com.nexopp.ai.dto.ChatRequest;
import com.nexopp.ai.dto.ChatResponse;
import com.nexopp.ai.dto.EmiResponse;

public interface AiService {
    ChatResponse handleChat(ChatRequest request);
    EmiResponse handleEmiCalculation(double amount, double rate, int tenure);
}
