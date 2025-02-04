import {openai} from '@ai-sdk/openai';
import {fireworks} from '@ai-sdk/fireworks';
import {google} from '@ai-sdk/google';
import {anthropic} from '@ai-sdk/anthropic';


import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

export const myProvider = customProvider({
    languageModels: {
        'chat-model-small-openai': openai('gpt-4o-mini'),
        'chat-model-large-openai': openai('gpt-4o'),
        'chat-model-reasoning-small-openai': openai('o1-mini'),
        'chat-model-reasoning-large-openai': openai('o1-preview'),
        // 'chat-model-reasoning': fireworks('accounts/fireworks/models/deepseek-r1'),

        // 'chat-model-reasoning': wrapLanguageModel({
        //   model: fireworks('accounts/fireworks/models/deepseek-r1'),
        //   middleware: extractReasoningMiddleware({ tagName: 'think' }),
        // }),
        'chat-model-small-google': google('gemini-1.5-flash'),
        'chat-model-reasoning-small-google': google('gemini-1.5-pro'),
        'chat-model-reasoning-large-google': google('gemini-2.0-flash-exp'),

        'chat-model-small-calude': anthropic('claude-3-haiku-20240307'),
        'chat-model-large-calude': anthropic('claude-3-5-haiku-20241022'),
        'chat-model-writing-calude': anthropic('claude-3-opus-20240229'),
        'chat-model-intelligent-calude': anthropic('claude-3-5-sonnet-latest'),


        'title-model': openai('gpt-4-turbo'),
        'block-model': openai('gpt-4o-mini'),
    },
    imageModels: {
        'small-model': openai.image('dall-e-3'),
    },
});

interface ChatModel {
    id: string;
    name: string;
    description: string;
}

export const chatModels: Array<ChatModel> = [
    {
        id: 'chat-model-small-openai',
        name: 'GPT 4o mini',
        description: 'Small model for fast, lightweight tasks',
    },
    {
        id: 'chat-model-large-openai',
        name: 'GPT 4o',
        description: 'Large model for complex, multi-step tasks',
    },
    // {
    //   id: 'chat-model-reasoning',
    //   name: 'DeepSeek R1',
    //   description: 'Uses advanced reasoning (Best DeepSeek model)',
    // },
    {
        id: 'chat-model-reasoning-small-openai',
        name: 'o1-mini',
        description: 'Uses advanced reasoning',
    },
    {
        id: 'chat-model-reasoning-large-openai',
        name: 'o1-preview',
        description: 'Uses advanced reasoning (Best OpenAI model)',
    },
    {
        id: 'chat-model-small-google',
        name: 'Gemini 1.5 Flash',
        description: 'Small model for fast, lightweight tasks',
    },
    {
        id: 'chat-model-reasoning-small-google',
        name: 'Gemini 1.5 Pro',
        description: 'Uses advanced reasoning',
    },
    {
        id: 'chat-model-reasoning-large-google',
        name: 'Gemini 2.0 Flash Exp',
        description: 'Uses advanced reasoning (Best Google model)',
    },
    {
        id: 'chat-model-small-calude',
        name: 'Claude 3 Haiku',
        description: 'Small model for fast, lightweight tasks',
    },
    {
        id: 'chat-model-large-calude',
        name: 'Claude 3.5 Haiku',
        description: 'Large model for complex, multi-step tasks',
    },
    {
        id: 'chat-model-writing-calude',
        name: 'Claude 3 Opus',
        description: 'Large model for writing tasks',
    },
    {
        id: 'chat-model-intelligent-calude',
        name: 'Claude 3.5 Sonnet',
        description: 'Large model for most intelligent tasks (Best Calude model)',
    },


];
