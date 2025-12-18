import OpenAI from 'openai';

export class OpenAIConfig {
  private static instance: OpenAI;

  static getInstance(): OpenAI {
    if (!OpenAIConfig.instance) {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'Missing OpenAI configuration. Please set OPENAI_API_KEY environment variable.',
        );
      }

      OpenAIConfig.instance = new OpenAI({
        apiKey: apiKey,
      });
    }

    return OpenAIConfig.instance;
  }
}

export const openai = OpenAIConfig.getInstance;
