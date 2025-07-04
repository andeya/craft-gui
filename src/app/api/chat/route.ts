import { streamText } from "ai";
import { ollama } from "ollama-ai-provider";

const OLLAMA_MODEL = "llama3.1";

export const maxDuration = 30;

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages } = await req.json();
  const result = streamText({
    model: ollama(OLLAMA_MODEL),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    messages,
  });
  return result.toDataStreamResponse();
}
