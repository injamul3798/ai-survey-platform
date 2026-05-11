import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../api/client";
import type { GeneratedSurveyDraft, SurveyResponse } from "../api/types";
import { Button } from "../components/ui/Button";
import { FormError } from "../components/ui/FormError";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { useAuth } from "../features/auth/AuthProvider";

const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 20;
const MIN_OPTION_COUNT = 2;
const MAX_OPTION_COUNT = 6;

const surveyOptionSchema = z.object({
  option_text: z.string().min(1, "Option is required"),
  is_correct: z.boolean(),
});

const surveyQuestionSchema = z
  .object({
    question_text: z.string().min(1, "Question is required"),
    options: z.array(surveyOptionSchema).min(2).max(6),
  })
  .superRefine((value, ctx) => {
    const correctCount = value.options.filter((option) => option.is_correct).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select one correct answer",
        path: ["options"],
      });
    }
  });

const schema = z
  .object({
    topic: z.string().min(1, "Topic is required"),
    question_count: z.coerce.number().min(MIN_QUESTION_COUNT).max(MAX_QUESTION_COUNT),
    option_count: z.coerce.number().min(MIN_OPTION_COUNT).max(MAX_OPTION_COUNT),
    title: z.string().min(1, "Survey title is required"),
    questions: z.array(surveyQuestionSchema).min(MIN_QUESTION_COUNT).max(MAX_QUESTION_COUNT),
  })
  .superRefine((value, ctx) => {
    if (value.questions.length !== value.question_count) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Question count must match configuration",
        path: ["questions"],
      });
    }
    value.questions.forEach((question, index) => {
      if (question.options.length !== value.option_count) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option count must match configuration",
          path: ["questions", index, "options"],
        });
      }
    });
  });

type FormValues = z.infer<typeof schema>;

function draftToForm(draft: GeneratedSurveyDraft): Pick<FormValues, "title" | "questions"> {
  return {
    title: draft.title,
    questions: draft.questions.map((question) => ({
      question_text: question.question,
      options: question.options.map((option, index) => ({
        option_text: option,
        is_correct: index === question.correct_answer_index,
      })),
    })),
  };
}

export function SurveyCreatePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<GeneratedSurveyDraft | null>(null);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      topic: "",
      question_count: 3,
      option_count: 4,
      title: "",
      questions: [],
    },
  });

  const { fields: questionFields, replace } = useFieldArray({
    control,
    name: "questions",
  });

  const generateMutation = useMutation({
    mutationFn: (payload: { topic: string; question_count: number; option_count: number }) =>
      apiFetch<GeneratedSurveyDraft>("/api/surveys/generate", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      }),
    onSuccess: (generated) => {
      setDraft(generated);
      const mapped = draftToForm(generated);
      setValue("title", mapped.title);
      replace(mapped.questions);
    },
  });

  const regenerateQuestionMutation = useMutation({
    mutationFn: (targetIndex: number) => {
      const values = getValues();
      const generatedQuestions = values.questions.map((question) => ({
        question: question.question_text,
        options: question.options.map((option) => option.option_text),
        correct_answer_index: question.options.findIndex((option) => option.is_correct),
      }));
      return apiFetch<GeneratedSurveyDraft>("/api/surveys/generate-question", {
        method: "POST",
        token,
        body: JSON.stringify({
          topic: values.topic,
          title: values.title,
          question_count: values.question_count,
          option_count: values.option_count,
          target_index: targetIndex,
          questions: generatedQuestions,
        }),
      });
    },
    onSuccess: (generated) => {
      setDraft(generated);
      const mapped = draftToForm(generated);
      setValue("title", mapped.title);
      replace(mapped.questions);
    },
  });

  const createSurveyMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiFetch<SurveyResponse>("/api/surveys", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: values.title,
          topic: values.topic,
          question_count: values.question_count,
          option_count: values.option_count,
          ai_response: draft ?? {
            title: values.title,
            questions: values.questions.map((question) => ({
              question: question.question_text,
              options: question.options.map((option) => option.option_text),
              correct_answer_index: question.options.findIndex((option) => option.is_correct),
            })),
          },
          questions: values.questions,
        }),
      }),
    onSuccess: async (survey) => {
      await queryClient.invalidateQueries({ queryKey: ["surveys"] });
      navigate("/surveys", {
        state: {
          successMessage: `Survey "${survey.title}" was created successfully and is now ready for invitation delivery.`,
        },
      });
    },
  });

  const optionCount = watch("option_count");

  function handleGenerate() {
    const values = getValues();
    generateMutation.mutate({
      topic: values.topic,
      question_count: values.question_count,
      option_count: values.option_count,
    });
  }

  function handleCancel() {
    setDraft(null);
    reset({
      topic: "",
      question_count: 3,
      option_count: 4,
      title: "",
      questions: [],
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="eyebrow">AI Authoring</p>
        <h1 className="text-2xl font-semibold">Create Survey</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Define the survey topic, control the draft size, then refine the AI-generated questions before saving the final survey.
        </p>
      </div>

      <div className="panel p-6">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="text-base font-semibold text-ink">Generation Settings</h2>
            <p className="mt-1 text-sm text-muted">Use a clear topic and sensible counts to produce cleaner first-pass drafts.</p>
          </div>
          <span className="chip">1-20 questions</span>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_140px_140px_auto]">
          <div>
            <label className="label">Topic</label>
            <Textarea placeholder="Example: Customer satisfaction with ITM online support services" {...register("topic")} />
            <FormError message={errors.topic?.message} />
          </div>
          <div>
            <label className="label">Questions</label>
            <Input
              type="number"
              min={MIN_QUESTION_COUNT}
              max={MAX_QUESTION_COUNT}
              {...register("question_count")}
            />
            <FormError message={errors.question_count?.message} />
          </div>
          <div>
            <label className="label">Options Per Question</label>
            <Input
              type="number"
              min={MIN_OPTION_COUNT}
              max={MAX_OPTION_COUNT}
              {...register("option_count")}
            />
            <FormError message={errors.option_count?.message} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleGenerate} type="button" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating..." : "Generate With AI"}
            </Button>
          </div>
        </div>
        {generateMutation.error && (
          <div className="notice-error mt-4">
            {generateMutation.error instanceof Error ? generateMutation.error.message : "Failed to generate survey"}
          </div>
        )}
      </div>

      <form className="space-y-6" onSubmit={handleSubmit((values) => createSurveyMutation.mutate(values))}>
        <div className="panel p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">Survey Title</h2>
            <p className="mt-1 text-sm text-muted">Keep the title concise and recognizable for both admins and participants.</p>
          </div>
          <label className="label">Survey Title</label>
          <Input {...register("title")} />
          <FormError message={errors.title?.message} />
        </div>

        <div className="space-y-4">
          {questionFields.map((question, questionIndex) => (
            <div key={question.id} className="panel p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Question {questionIndex + 1}</h2>
                  <p className="mt-1 text-sm text-muted">Review the wording carefully and mark exactly one correct option.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => regenerateQuestionMutation.mutate(questionIndex)}
                  disabled={regenerateQuestionMutation.isPending}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              <div>
                <label className="label">Question Text</label>
                <Textarea {...register(`questions.${questionIndex}.question_text`)} />
                <FormError message={errors.questions?.[questionIndex]?.question_text?.message} />
              </div>

              <div className="mt-5 grid gap-4">
                {Array.from({ length: optionCount }).map((_, optionIndex) => (
                  <div key={`${question.id}-${optionIndex}`} className="grid gap-3 md:grid-cols-[24px_minmax(0,1fr)]">
                    <div className="flex items-start pt-3">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={watch(`questions.${questionIndex}.options.${optionIndex}.is_correct`) ?? false}
                        onChange={() => {
                          for (let index = 0; index < optionCount; index += 1) {
                            setValue(`questions.${questionIndex}.options.${index}.is_correct`, index === optionIndex);
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Option {optionIndex + 1}</label>
                      <Input {...register(`questions.${questionIndex}.options.${optionIndex}.option_text`)} />
                    </div>
                  </div>
                ))}
                <FormError
                  message={
                    (errors.questions?.[questionIndex]?.options as { message?: string } | undefined)?.message
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {createSurveyMutation.error && (
          <div className="notice-error">
            {createSurveyMutation.error instanceof Error ? createSurveyMutation.error.message : "Failed to save survey"}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={handleGenerate} disabled={generateMutation.isPending}>
            Full Regenerate
          </Button>
          <Button type="submit" disabled={createSurveyMutation.isPending}>
            {createSurveyMutation.isPending ? "Saving..." : "Save Survey"}
          </Button>
        </div>
      </form>
    </section>
  );
}

