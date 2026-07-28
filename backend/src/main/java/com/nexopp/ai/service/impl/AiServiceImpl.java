package com.nexopp.ai.service.impl;

import com.nexopp.ai.dto.ChatRequest;
import com.nexopp.ai.dto.ChatResponse;
import com.nexopp.ai.dto.EmiResponse;
import com.nexopp.ai.orchestrator.AiOrchestrator;
import com.nexopp.ai.service.AiService;
import com.nexopp.ai.tools.EmiTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AiServiceImpl implements AiService {

    private final AiOrchestrator aiOrchestrator;
    private final EmiTool emiTool;

    @Autowired
    public AiServiceImpl(AiOrchestrator aiOrchestrator, EmiTool emiTool) {
        this.aiOrchestrator = aiOrchestrator;
        this.emiTool = emiTool;
    }

    @Override
    public ChatResponse handleChat(ChatRequest request) {
        return aiOrchestrator.processPrompt(request);
    }

    @Override
    public EmiResponse handleEmiCalculation(double amount, double rate, int tenure) {
        return emiTool.calculateEmi(amount, rate, tenure);
    }
}
