package com.nexopp.ai.dto;

public class EmiResponse {
    private double loanAmount;
    private double interestRate;
    private int tenureYears;
    private double monthlyEmi;

    public EmiResponse() {}

    public EmiResponse(double loanAmount, double interestRate, int tenureYears, double monthlyEmi) {
        this.loanAmount = loanAmount;
        this.interestRate = interestRate;
        this.tenureYears = tenureYears;
        this.monthlyEmi = monthlyEmi;
    }

    public double getLoanAmount() { return loanAmount; }
    public void setLoanAmount(double loanAmount) { this.loanAmount = loanAmount; }

    public double getInterestRate() { return interestRate; }
    public void setInterestRate(double interestRate) { this.interestRate = interestRate; }

    public int getTenureYears() { return tenureYears; }
    public void setTenureYears(int tenureYears) { this.tenureYears = tenureYears; }

    public double getMonthlyEmi() { return monthlyEmi; }
    public void setMonthlyEmi(double monthlyEmi) { this.monthlyEmi = monthlyEmi; }
}
