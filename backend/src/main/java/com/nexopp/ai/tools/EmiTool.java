package com.nexopp.ai.tools;

import com.nexopp.ai.dto.EmiResponse;
import org.springframework.stereotype.Component;

@Component
public class EmiTool {

    public EmiResponse calculateEmi(double amountInLakhs, double interestRate, int tenureYears) {
        double P = amountInLakhs * 100000;
        double r = interestRate / (12 * 100);
        int n = tenureYears * 12;
        
        double emi = 0;
        if (r > 0 && n > 0) {
            emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        return new EmiResponse(amountInLakhs, interestRate, tenureYears, Math.round(emi));
    }
}
