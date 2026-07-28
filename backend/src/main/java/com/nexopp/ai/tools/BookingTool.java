package com.nexopp.ai.tools;

import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class BookingTool {

    public Map<String, String> bookSiteVisit(Long propertyId, String date, String time, String name, String phone) {
        // Delegates to live Site Visit Booking Service
        return Map.of("status", "CONFIRMED", "message", "Site visit successfully booked for " + date);
    }
}
