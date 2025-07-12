/**
 * @fileOverview A conversational support AI agent.
 *
 * - supportChat - A function that handles a conversation with a user.
 * - SupportChatInput - The input type for the supportChat function.
 * - SupportChatOutput - The return type for the supportChat function.
 */

import {ai} from '@/ai/genkit';
import {getProductCatalogForAI} from '@/lib/data';
import {generate, z} from 'genkit';
import type {Message} from 'genkit';

const SupportChatInputSchema = z.object({
  history: z.any(), // Using z.any() as Zod schema for Genkit Message is complex
  newMessage: z.string().describe('The latest message from the user.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(
  input: SupportChatInput
): Promise<SupportChatOutput> {
  return supportChatFlow(input);
}

const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async ({history, newMessage}) => {
    const productCatalog = getProductCatalogForAI();

    const llmResponse = await generate({
      model: 'googleai/gemini-2.0-flash',
      system: `You are a friendly and helpful customer support agent for a digital marketplace called 'TopUp Hub'. Your goal is to assist users with their questions about products, orders, and payment methods. Be concise and clear in your answers.

Here is the current product catalog you can reference:
${productCatalog}`,
      history: history as Message[],
      prompt: newMessage,
    });

    return {response: llmResponse.text};
  }
);
