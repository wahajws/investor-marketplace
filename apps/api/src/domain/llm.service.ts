import { Injectable } from '@nestjs/common';
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
    const apiKey = this.config.get<string>('ALIBABA_API_KEY') || this.config.get<string>('VITE_ALIBABA_API_KEY');
    const baseUrl = this.config.get<string>('ALIBABA_API_BASE_URL', 'https://dashscope-intl.aliyuncs.com');
    const model = this.config.get<string>('ALIBABA_MODEL', 'qwen-plus');
    const promptJson = { system: input.system, user: input.user };

    if (!apiKey) {
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
        return input.fallback;
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content;
      const parsed = typeof content === 'string' ? JSON.parse(content) : input.fallback;
      return this.logRun(input, model, promptJson, parsed, 'COMPLETE');
    } catch (error) {
      await this.logRun(input, model, promptJson, { fallback: input.fallback }, 'FAILED', error instanceof Error ? error.message : String(error));
      return input.fallback;
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
