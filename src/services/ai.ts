import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeObjection(input: { text?: string; imageBase64?: string; audioBase64?: string; mimeType?: string }) {
  const model = "gemini-3.1-pro-preview";
  
  let prompt = `Você é um especialista em vendas de CONSÓRCIO de alto nível. Analise a objeção fornecida (que pode vir em texto, imagem de conversa ou áudio de cliente) e gere 3 scripts de vendas persuasivos específicos para o mercado de CONSÓRCIO para contorná-la. 
  
  Considere as particularidades do consórcio: taxa de administração vs juros, lances, sorteios, poder de compra à vista, planejamento financeiro e segurança.
  
  Para cada script, explique a lógica por trás dele.
  Use técnicas como Empatia, Reenquadramento, Prova Social e Comparativo Financeiro (Consórcio x Financiamento).
  
  Formate a resposta em JSON com a seguinte estrutura:
  {
    "objection_summary": "Resumo da objeção identificada no contexto de consórcio",
    "scripts": [
      {
        "title": "Título do Script (ex: Abordagem de Planejamento Financeiro)",
        "content": "O texto do script para o vendedor falar ou enviar",
        "logic": "Explicação técnica de por que isso funciona no consórcio"
      }
    ]
  }`;

  const parts: any[] = [{ text: prompt }];

  if (input.imageBase64 && input.mimeType?.startsWith('image/')) {
    parts.push({
      inlineData: {
        data: input.imageBase64,
        mimeType: input.mimeType
      }
    });
  }

  if (input.audioBase64 && input.mimeType?.startsWith('audio/')) {
    parts.push({
      inlineData: {
        data: input.audioBase64,
        mimeType: input.mimeType
      }
    });
  }

  if (input.text) {
    parts.push({ text: `Objeção do cliente: ${input.text}` });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  return JSON.parse(response.text || "{}");
}
