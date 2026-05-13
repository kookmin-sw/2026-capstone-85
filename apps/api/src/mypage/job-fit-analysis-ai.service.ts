import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

type JobFitAnalysisAiJob = {
  title: string;
  description: string;
  jobFamily: string;
  employmentType: string;
  companyType: string;
  kicpaCondition: string;
  traineeStatus: string;
  practicalTrainingInstitution: boolean | null;
  minExperienceYears: number | null;
  maxExperienceYears: number | null;
  location: string | null;
  deadlineType: string;
  deadline: string | null;
  labels: string[];
  company: {
    name: string;
    type: string;
    tags: string[];
    description: string | null;
  };
};

type JobFitAnalysisAiResume = {
  fileName: string;
  contentType: string;
  byteSize: number;
  textSample: string | null;
};

export type GenerateJobFitAnalysisInput = {
  job: JobFitAnalysisAiJob;
  resume: JobFitAnalysisAiResume;
};

export type GeneratedJobFitAnalysis = {
  fitScore: number;
  summary: string;
  strengths: string[];
  companyPriorities: string[];
  gaps: string[];
  recommendation: string;
  rawJson: Record<string, unknown>;
};

type RawObject = Record<string, unknown>;

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const MAX_ITEMS = 4;

@Injectable()
export class JobFitAnalysisAiService {
  private client: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  async generate(
    input: GenerateJobFitAnalysisInput,
  ): Promise<GeneratedJobFitAnalysis> {
    const openai = this.getClient();
    const model =
      this.config.get<string>('OPENAI_JOB_FIT_MODEL')?.trim() ||
      this.config.get<string>('OPENAI_MODEL')?.trim() ||
      DEFAULT_OPENAI_MODEL;

    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.2,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'job_fit_analysis',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: [
                'fitScore',
                'summary',
                'strengths',
                'companyPriorities',
                'gaps',
                'recommendation',
              ],
              properties: {
                fitScore: {
                  type: 'integer',
                  description:
                    '공고와 이력서 텍스트의 상대 적합도 점수. 실제 합격 확률이 아니다.',
                },
                summary: { type: 'string' },
                strengths: {
                  type: 'array',
                  items: { type: 'string' },
                },
                companyPriorities: {
                  type: 'array',
                  items: { type: 'string' },
                },
                gaps: {
                  type: 'array',
                  items: { type: 'string' },
                },
                recommendation: { type: 'string' },
              },
            },
          },
        },
        messages: [
          {
            role: 'system',
            content:
              '너는 CPA 채용공고와 이력서를 비교하는 한국어 커리어 분석 도우미다. 개인 식별 정보는 출력하지 말고, 근거가 부족하면 그 한계를 보완점에 명시한다. 반드시 JSON만 반환한다.',
          },
          {
            role: 'user',
            content: this.buildPrompt(input),
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('empty OpenAI response');

      const parsed = this.asObject(JSON.parse(content)) ?? {};
      const normalized = this.normalize(parsed);

      return {
        ...normalized,
        rawJson: {
          provider: 'openai',
          model,
          responseId: completion.id,
          parsed,
        },
      };
    } catch {
      throw new ServiceUnavailableException(
        'AI 적합도 분석 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  }

  private getClient() {
    const apiKey = this.config.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OpenAI API 키가 설정되어 있지 않습니다.',
      );
    }

    if (!this.client) {
      this.client = new OpenAI({
        apiKey,
        maxRetries: 1,
        timeout: 25_000,
      });
    }

    return this.client;
  }

  private buildPrompt(input: GenerateJobFitAnalysisInput) {
    const job = input.job;
    const resume = input.resume;
    const resumeText =
      resume.textSample ??
      '이력서 본문 텍스트를 추출하지 못했습니다. 파일명과 공고 조건만 참고하세요.';

    return [
      '아래 채용공고와 이력서 텍스트 샘플을 비교해 구직자에게 보여줄 적합도 분석 JSON을 작성하세요.',
      '',
      '분석 규칙:',
      '- fitScore는 실제 합격 확률이 아니라 공고 요건과 이력서 근거의 상대 적합도 점수입니다.',
      '- summary와 recommendation은 한국어 한두 문장으로 작성합니다.',
      '- strengths, companyPriorities, gaps는 각각 짧은 한국어 문장 배열로 작성합니다.',
      '- 이력서 텍스트가 부족하면 gaps에 "이력서 본문 근거가 부족하다"는 취지의 보완점을 포함합니다.',
      '- KICPA, 수습 가능 여부, 경력 연수, 직무군, 회사 유형을 우선 비교합니다.',
      '',
      '공고:',
      JSON.stringify(
        {
          title: job.title,
          description: this.limit(job.description, 5000),
          jobFamily: job.jobFamily,
          employmentType: job.employmentType,
          companyType: job.companyType,
          kicpaCondition: job.kicpaCondition,
          traineeStatus: job.traineeStatus,
          practicalTrainingInstitution: job.practicalTrainingInstitution,
          minExperienceYears: job.minExperienceYears,
          maxExperienceYears: job.maxExperienceYears,
          location: job.location,
          deadlineType: job.deadlineType,
          deadline: job.deadline,
          labels: job.labels,
          company: {
            name: job.company.name,
            type: job.company.type,
            tags: job.company.tags,
            description: job.company.description,
          },
        },
        null,
        2,
      ),
      '',
      '이력서:',
      JSON.stringify(
        {
          fileName: resume.fileName,
          contentType: resume.contentType,
          byteSize: resume.byteSize,
          textSample: this.limit(resumeText, 5000),
        },
        null,
        2,
      ),
    ].join('\n');
  }

  private normalize(raw: RawObject): Omit<GeneratedJobFitAnalysis, 'rawJson'> {
    return {
      fitScore: this.clampInteger(raw.fitScore, 0, 100, 60),
      summary: this.stringValue(raw.summary, 700),
      strengths: this.stringArray(raw.strengths),
      companyPriorities: this.stringArray(raw.companyPriorities),
      gaps: this.stringArray(raw.gaps),
      recommendation: this.stringValue(raw.recommendation, 700),
    };
  }

  private asObject(value: unknown): RawObject | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as RawObject)
      : null;
  }

  private clampInteger(
    value: unknown,
    min: number,
    max: number,
    fallback: number,
  ) {
    const parsed =
      typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  }

  private stringArray(value: unknown) {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => this.stringValue(item, 240))
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  }

  private stringValue(value: unknown, maxLength: number) {
    return typeof value === 'string'
      ? this.limit(value.replace(/\s+/g, ' ').trim(), maxLength)
      : '';
  }

  private limit(value: string, maxLength: number) {
    return value.length > maxLength ? value.slice(0, maxLength) : value;
  }
}
