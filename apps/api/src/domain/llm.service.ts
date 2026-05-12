import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

type RunInput = {
  userId?: string;
  companyId?: string;
  documentId?: string;
  task: string;
  system: string;
  user: string;
  fallback: Record<string, unknown>;
};

@Injectable()
export class LlmService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  async runJson(input: RunInput) {
    return this.runJsonInternal(input, false);
  }

  async runRequiredJson(input: RunInput) {
    return this.runJsonInternal(input, true);
  }

  isConfigured() {
    return Boolean(this.getApiKey());
  }

  private async runJsonInternal(input: RunInput, required: boolean) {
    const apiKey = this.config.get<string>('ALIBABA_API_KEY') || this.config.get<string>('VITE_ALIBABA_API_KEY');
    const baseUrl = this.config.get<string>('ALIBABA_API_BASE_URL', 'https://dashscope-intl.aliyuncs.com');
    const model = this.config.get<string>('ALIBABA_MODEL', 'qwen-plus');
    const promptJson = { system: input.system, user: input.user };

    if (!apiKey) {
      if (required) {
        await this.logRun(input, model, promptJson, { error: 'ALIBABA_API_KEY is not configured.' }, 'FAILED', 'ALIBABA_API_KEY is not configured.');
        throw new ServiceUnavailableException('Alibaba Qwen is not configured. Set ALIBABA_API_KEY in apps/api/.env and restart the API.');
      }
      return this.logRun(input, model, promptJson, input.fallback, 'FALLBACK');
    }

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/compatible-mode/v1/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: input.system },
            { role: 'user', content: input.user }
          ]
        })
      });

      if (!response.ok) {
        const text = await response.text();
        await this.logRun(input, model, promptJson, { fallback: input.fallback }, 'FAILED', text);
        if (required) throw new BadGatewayException(`Alibaba Qwen request failed: ${text.slice(0, 300)}`);
        return input.fallback;
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      const parsed = typeof content === 'string' ? this.parseJsonContent(content) : input.fallback;
      return this.logRun(input, model, promptJson, parsed, 'COMPLETE');
    } catch (error) {
      await this.logRun(input, model, promptJson, { fallback: input.fallback }, 'FAILED', error instanceof Error ? error.message : String(error));
      if (required) {
        if (error instanceof ServiceUnavailableException || error instanceof BadGatewayException) throw error;
        throw new BadGatewayException(error instanceof Error ? error.message : 'Alibaba Qwen request failed.');
      }
      return input.fallback;
    }
  }

  private getApiKey() {
    return this.config.get<string>('ALIBABA_API_KEY') || this.config.get<string>('VITE_ALIBABA_API_KEY');
  }

  private parseJsonContent(content: string) {
    try {
      return JSON.parse(content);
    } catch {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(content.slice(start, end + 1));
      }
      throw new Error('Alibaba Qwen returned non-JSON content.');
    }
  }

  private async logRun(input: RunInput, model: string, promptJson: Record<string, unknown>, outputJson: Record<string, unknown>, status: string, errorText?: string) {
    await this.prisma.llmRun.create({
      data: {
        userId: input.userId,
        companyId: input.companyId,
        documentId: input.documentId,
        task: input.task,
        model,
        status,
        promptJson: JSON.parse(JSON.stringify(promptJson)),
        inputJson: { companyId: input.companyId, documentId: input.documentId },
        outputJson: JSON.parse(JSON.stringify(outputJson)),
        errorText
      }
    });
    return outputJson;
  }
}
