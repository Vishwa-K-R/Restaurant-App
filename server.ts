import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Recommendations using Gemini 3.5-flash
  app.post("/api/ai-recommendations", async (req, res) => {
    const { mood, language } = req.body;
    
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      // Return a 400 so the frontend can immediately trigger its elegant high-fidelity client-side recommendation engine smoothly.
      return res.status(400).json({ error: "Gemini API Key is not set in secrets" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = language === 'ta'
        ? "You are DineFlow's friendly, professional Tamil chef expert. Recommend exactly one South Indian or popular item that fits their craving from the following menu items: 'Ghee Podi Masala Dosa' (நெய் பொடி மசாலா தோசை), 'Royal Ambur Chicken Biryani' (ஆம்பூர் சிக்கன் பிரியாணி), 'Madurai Malligai Poo Idli' (மதுரை மல்லிகைப்பூ இட்லி), 'Kumbakonam Degree Filter Coffee' (கும்பகோணம் டிகிரி ஃபில்டர் காபி), 'Paneer Butter Masala' (பனீர் பட்டர் மசாலா), 'Alphonso Mango Lassi' (குனைந்த அல்போன்சா மாம்பழ லஸ்ஸி), 'Saffron Elaneer Payasam' (குங்குமப்பூ இளநீர் பாயசம்). Give your answer in beautiful positive and appetizing Tamil under 80 words. Include some details about why it fits their flavor mood."
        : "You are DineFlow's friendly local chef. Recommend exactly one South Indian or popular option that fits the user's craving/flavor mood from these menu items: 'Ghee Podi Masala Dosa', 'Royal Ambur Chicken Biryani', 'Madurai Malligai Poo Idli', 'Kumbakonam Degree Filter Coffee', 'Paneer Butter Masala', 'Alphonso Mango Lassi', 'Saffron Elaneer Payasam'. Keep your reply encouraging, food-loving, and under 80 words. Describe why it matches their mood beautifully.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Recommend a dish for a user whose current flavor mood is: "${mood}". Explain why.`,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      // Simple keyword match to find related dish for frontend highlighting
      const text = response.text || "";
      const keywords: string[] = [];
      
      const dishes = [
        "Dosa", "Biryani", "Idli", "Coffee", "Paneer", "Lassi", "Payasam",
        "தோசை", "பிரியாணி", "இட்லி", "காபி", "பனீர்", "லஸ்ஸி", "பாயசம்"
      ];
      
      dishes.forEach(dish => {
        if (text.toLowerCase().includes(dish.toLowerCase()) || text.includes(dish)) {
          keywords.push(dish);
        }
      });

      res.json({ text, keywords });
    } catch (error: any) {
      console.error("Gemini recommendation error:", error);
      res.status(500).json({ error: "Failed to generate recommendation from Gemini" });
    }
  });

  // Hot-reloading Vite dev server when not in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DineFlow synchronization server running on port ${PORT}`);
  });
}

startServer();
