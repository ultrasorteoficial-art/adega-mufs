import { describe, expect, it } from "vitest";
import { generateComparisonPDF, generateHistoryPDF } from "./export/pdf";
import { generateComparisonExcel, generateHistoryExcel } from "./export/excel";

describe("PDF Export", () => {
  it("should generate comparison PDF successfully", async () => {
    const mockData = [
      {
        id: 1,
        name: "Test Product",
        average: "10.50",
        competitorPrices: {
          "Dinho": { value: "10.00", updatedAt: new Date() },
          "Adega Brasil": { value: "11.00", updatedAt: new Date() },
          "Franco": { value: "10.50", updatedAt: new Date() },
          "Diversos": { value: "10.75", updatedAt: new Date() },
        },
        lastUpdated: new Date(),
      },
    ];

    const pdf = await generateComparisonPDF(mockData);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it("should generate history PDF successfully", async () => {
    const mockHistory = [
      {
        id: 1,
        productName: "Test Product",
        competitorName: "Dinho",
        changeType: "created",
        previousValue: null,
        newValue: "10.50",
        changedAt: new Date(),
      },
    ];

    const pdf = await generateHistoryPDF(mockHistory);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });

  it("should handle empty data in PDF generation", async () => {
    const pdf = await generateComparisonPDF([]);
    expect(pdf).toBeInstanceOf(Buffer);
    expect(pdf.length).toBeGreaterThan(0);
  });
});

describe("Excel Export", () => {
  it("should generate comparison Excel successfully", () => {
    const mockData = [
      {
        id: 1,
        name: "Test Product",
        average: "10.50",
        competitorPrices: {
          "Dinho": { value: "10.00", updatedAt: new Date() },
          "Adega Brasil": { value: "11.00", updatedAt: new Date() },
          "Franco": { value: "10.50", updatedAt: new Date() },
          "Diversos": { value: "10.75", updatedAt: new Date() },
        },
        lastUpdated: new Date(),
      },
    ];

    const excel = generateComparisonExcel(mockData);
    expect(excel).toBeInstanceOf(Buffer);
    expect(excel.length).toBeGreaterThan(0);
  });

  it("should generate history Excel successfully", () => {
    const mockHistory = [
      {
        id: 1,
        productName: "Test Product",
        competitorName: "Dinho",
        changeType: "updated",
        previousValue: "10.00",
        newValue: "10.50",
        changedAt: new Date(),
      },
    ];

    const excel = generateHistoryExcel(mockHistory);
    expect(excel).toBeInstanceOf(Buffer);
    expect(excel.length).toBeGreaterThan(0);
  });

  it("should handle empty data in Excel generation", () => {
    const excel = generateComparisonExcel([]);
    expect(excel).toBeInstanceOf(Buffer);
    expect(excel.length).toBeGreaterThan(0);
  });

  it("should handle null average values", () => {
    const mockData = [
      {
        id: 1,
        name: "Test Product",
        average: null,
        competitorPrices: {
          "Dinho": null,
          "Adega Brasil": null,
          "Franco": null,
          "Diversos": null,
        },
        lastUpdated: null,
      },
    ];

    const excel = generateComparisonExcel(mockData);
    expect(excel).toBeInstanceOf(Buffer);
    expect(excel.length).toBeGreaterThan(0);
  });
});
