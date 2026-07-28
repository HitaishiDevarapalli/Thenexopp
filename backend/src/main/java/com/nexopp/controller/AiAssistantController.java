package com.nexopp.controller;

import com.nexopp.dto.AiChatRequest;
import com.nexopp.dto.AiChatResponse;
import com.nexopp.service.AiOrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiAssistantController {

    private final AiOrchestratorService aiOrchestratorService;

    @Autowired
    public AiAssistantController(AiOrchestratorService aiOrchestratorService) {
        this.aiOrchestratorService = aiOrchestratorService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chatWithAi(@RequestBody AiChatRequest request) {
        AiChatResponse response = aiOrchestratorService.processChatQuery(request);
        return ResponseEntity.ok(response);
    }
}
