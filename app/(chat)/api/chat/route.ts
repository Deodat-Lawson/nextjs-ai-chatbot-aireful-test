import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';

export const maxDuration = 60;

export async function POST(request: Request) {
  // Parse incoming request JSON
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
      await request.json();

  // Authenticate user
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get the most recent user message
  const userMessage = getMostRecentUserMessage(messages);
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  // Ensure the chat exists or create one if needed
  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  // Save the incoming user message
  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  // Determine if the selected model is a reasoning model.
  // (This example treats any model ID that includes "reasoning" as a reasoning model.)
  const isReasoningModel = selectedChatModel.includes('reasoning');

  return createDataStreamResponse({
    execute: (dataStream) => {
      let result;

      if (isReasoningModel) {
        // === Reasoning Model Configuration ===
        // Convert the messages array into a single prompt string.
        // Customize this logic as needed for your prompt design.
        const prompt = messages
            .map((msg) => {
              const roleLabel = msg.role === 'user' ? 'User:' : 'Assistant:';
              return `${roleLabel} ${msg.content}`;
            })
            .join('\n');

        result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          prompt, // Use the single prompt string
          maxSteps: 5,
          // Disable active tools for reasoning models (unless you wish to enable them)
          experimental_activeTools: [],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {}, // No tool integrations
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });
                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => ({
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  })),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });
      } else {
        // === Chat Model Configuration ===
        // For chat models, use the system prompt and structured messages.
        result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
              selectedChatModel === 'chat-model-large'
                  ? [
                    'getWeather',
                    'createDocument',
                    'updateDocument',
                    'requestSuggestions',
                  ]
                  : [], // For smaller chat models, you might disable tools for speed.
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({ session, dataStream }),
          },
          onFinish: async ({ response, reasoning }) => {
            if (session.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });
                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => ({
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  })),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });
      }

      // Merge the result stream into the response stream.
      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      return 'Oops, an error occured!';
    },
  });
}
