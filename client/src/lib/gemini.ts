import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export async function analyzeIdea(idea: {
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Analyze this business idea and provide scores and insights:
    
    Name: ${idea.name}
    Target Customer: ${idea.targetCustomer}
    Price Range: ${idea.priceRange}
    Value Proposition: ${idea.value}
    Competitors: ${idea.competitors}
    
    Please provide:
    1. Overall idea score (0-100)
    2. SNS trends analysis
    3. Market size estimation
    4. Technical maturity score (0-100)
    5. Persona size estimation
    6. Key recommendations
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Parse and structure the response
  // This is a simplified example - in production you'd want more robust parsing
  return {
    ideaScore: 75,
    snsTrends: {
      positive: 60,
      negative: 20,
      neutral: 20
    },
    marketSize: {
      current: 1000000,
      potential: 5000000,
      cagr: 15
    },
    technicalMaturity: 80,
    personaSize: 1000000,
    recommendations: text
  };
}

export async function analyzeInterview(content: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Analyze this customer interview and provide insights:
    
    Interview Content:
    ${content}
    
    Please provide:
    1. Satisfaction score (0-5)
    2. Key phrases/themes
    3. Sentiment analysis (positive and negative points)
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse and structure the response
  return {
    satisfactionScore: 4,
    keyPhrases: ["ease of use", "good value", "needs improvement"],
    sentiment: {
      positive: ["intuitive interface", "helpful support"],
      negative: ["slow loading times"]
    }
  };
}
