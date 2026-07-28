package com.nexopp.ai.controller;

import com.nexopp.ai.dto.ChatRequest;
import com.nexopp.ai.dto.ChatResponse;
import com.nexopp.ai.dto.EmiResponse;
import com.nexopp.ai.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.handleChat(request));
    }

    @PostMapping("/search")
    public ResponseEntity<ChatResponse> search(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.handleChat(request));
    }

    @PostMapping("/recommend")
    public ResponseEntity<ChatResponse> recommend(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.handleChat(request));
    }

    @PostMapping("/compare")
    public ResponseEntity<ChatResponse> compare(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.handleChat(request));
    }

    @PostMapping("/emi")
    public ResponseEntity<EmiResponse> calculateEmi(@RequestParam(defaultValue = "50") double amount,
                                                    @RequestParam(defaultValue = "8.5") double rate,
                                                    @RequestParam(defaultValue = "20") int tenure) {
        return ResponseEntity.ok(aiService.handleEmiCalculation(amount, rate, tenure));
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, String>> bookVisit(@RequestBody Map<String, Object> bookingDetails) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Site visit scheduled successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam String conversationId) {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> clearHistory(@RequestParam String conversationId) {
        return ResponseEntity.ok(Map.of("status", "CLEARED"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, String>> recordFeedback(@RequestBody Map<String, Object> feedback) {
        return ResponseEntity.ok(Map.of("status", "ACCEPTED"));
    }
}
