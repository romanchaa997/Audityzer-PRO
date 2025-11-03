
import { GoogleGenAI, Type } from "@google/genai";
import type { ScanResult } from '../types';

// Initialize the Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the expected JSON schema for the AI model's response
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.OBJECT,
            properties: {
                critical: { type: Type.INTEGER, description: "Number of critical vulnerabilities." },
                high: { type: Type.INTEGER, description: "Number of high severity vulnerabilities." },
                medium: { type: Type.INTEGER, description: "Number of medium severity vulnerabilities." },
                low: { type: Type.INTEGER, description: "Number of low severity vulnerabilities." },
            },
        },
        metrics: {
            type: Type.OBJECT,
            properties: {
                executionSpeed: { type: Type.NUMBER, description: "Execution speed in seconds." },
                testCoverage: { type: Type.NUMBER, description: "Test coverage in percentage." },
                defectDensity: { type: Type.NUMBER, description: "Defect density per 1,000 lines of code." },
            },
        },
        vulnerabilities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier for the vulnerability, e.g., 'vuln-1'." },
                    severity: { type: Type.STRING, description: "Severity of the vulnerability. Must be one of: 'Critical', 'High', 'Medium', 'Low'." },
                    title: { type: Type.STRING, description: "A concise title for the vulnerability." },
                    description: { type: Type.STRING, description: "A detailed description of the vulnerability." },
                    recommendation: { type: Type.STRING, description: "The recommended action to fix the vulnerability." },
                },
            },
        },
    },
};

export const analyzeContract = async (contractAddress: string): Promise<ScanResult> => {
  console.log(`Analyzing contract with Gemini: ${contractAddress}`);
  
  const prompt = `You are a world-class smart contract security auditor.
  Analyze the smart contract at address ${contractAddress} for security vulnerabilities.
  Assume you have access to the contract's source code.
  Provide a comprehensive audit report in JSON format.
  The report must include:
  1. A 'summary' object with the count of vulnerabilities for each severity level: 'critical', 'high', 'medium', 'low'.
  2. A 'metrics' object with 'executionSpeed' (in seconds), 'testCoverage' (as a percentage), and 'defectDensity' (defects per 1k LoC).
  3. A 'vulnerabilities' array, where each object has an 'id' (e.g., 'vuln-1'), 'severity' ('Critical', 'High', 'Medium', or 'Low'), a 'title', a 'description' of the issue, and a 'recommendation' for fixing it.
  
  For the purpose of this simulation, generate a realistic-looking report for a moderately complex DeFi contract with a few common vulnerabilities.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString) as ScanResult;
    return result;

  } catch (error) {
    console.error("Error analyzing contract with Gemini API:", error);
    throw new Error("Failed to analyze contract with Gemini. The AI model might have returned an invalid response.");
  }
};
