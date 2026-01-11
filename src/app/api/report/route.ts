import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { location, risk_score, biomass_loss, coordinates, year } = await request.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
      You are a Chief Carbon Auditor for VeriTree, a global carbon credit verification body.
      Generate a formal "Carbon Credit Verification & Audit Certificate" for a forestry project.
      
      **Project Details:**
      - Project Name: ${location}
      - Coordinates: ${coordinates.lat}, ${coordinates.lng}
      - Audit Year: ${year || '2023'}
      - Calculated Biomass Loss: ${biomass_loss}%
      - Automated Risk Score: ${risk_score}
      
      **Certificate Structure (Use Markdown):**
      # Carbon Credit Verification Certificate
      **Certificate ID:** VT-${Math.floor(Math.random() * 1000000)}
      **Date of Issue:** ${new Date().toLocaleDateString()}
      **Compliance Status:** ${risk_score === 'HIGH' ? 'NON-COMPLIANT' : risk_score === 'MEDIUM' ? 'UNDER REVIEW' : 'VERIFIED'}
      
      ## 1. Audit Summary
      [Provide a professional summary of the audit findings. State clearly whether the project is delivering on its carbon sequestration promises or if there are discrepancies.]

      ## 2. Satellite Evidence Analysis
      [Analyze the significance of the ${biomass_loss}% biomass loss detected by the satellite. Explain if this is within acceptable natural variance or indicates illegal logging/failure to protect the forest.]

      ## 3. Fraud Risk Assessment
      [Assess the likelihood of "Greenwashing" or "Ghost Credits" based on the High/Medium/Low risk score. Be direct and authoritative.]

      ## 4. Final Verdict & Recommendation
      [State whether the carbon credits for this project should be Validated, Suspended, or Revoked. Provide one clear next step for the registry.]
      
      **Signed:** VeriTree AI Auditor System
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ report: text });
    } catch (error) {
        console.error("Report generation failed:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
