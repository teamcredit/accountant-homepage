"use client";

import { useId, useState, useRef } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  startedAt: number;
  website: string;
}

const defaultForm: FormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
  startedAt: 0,
  website: "",
};

interface ContactFormProps {
  initialValues?: Partial<Pick<FormData, "message">>;
}

export default function ContactForm({ initialValues }: ContactFormProps) {
  const formId = useId();
  const submitting = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormData>(() => ({
    ...defaultForm,
    startedAt: Date.now(),
    ...initialValues,
  }));
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const fieldId = (field: keyof FormData) => `${formId}-${field}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ ...defaultForm, startedAt: Date.now(), ...initialValues });
      } else {
        let serverMessage = "";
        try {
          const data = await res.json();
          if (data && typeof data.error === "string") {
            serverMessage = data.error;
          }
        } catch {
          // ignore
        }
        setErrorMessage(res.status === 429 ? "요청이 많습니다. 잠시 후 다시 시도해 주세요." : serverMessage || `전송에 실패했습니다 (${res.status}).`);
        setStatus("error");
      }
    } catch {
      setErrorMessage("응답을 확인하지 못해 접수 여부가 확실하지 않습니다. 입력 내용은 유지됩니다. 잠시 후 확인하거나 직접 연락해 주세요.");
      setStatus("error");
    } finally {
      submitting.current = false;
      requestAnimationFrame(() => statusRef.current?.focus());
    }
  };

  if (status === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="py-20 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-foreground flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-3">
          문의가 접수되었습니다
        </h3>
        <p className="text-muted leading-relaxed mb-8">
          전달해 주신 내용을 확인 후 회신드리겠습니다.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="inline-flex items-center text-sm font-medium tracking-wider hover-underline"
        >
          새 문의 작성
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" aria-busy={status === "sending"}>
      {initialValues?.message && <p className="text-sm text-muted">선택한 서비스·견적 조건을 아래 현재 상황에 담았습니다. 확인하고 수정해 주세요.</p>}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={fieldId("website")}>Website</label>
        <input
          id={fieldId("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <label htmlFor={fieldId("name")} className="t-label block mb-3">
            이름 *
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={80}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-0 py-3 bg-transparent text-base border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors duration-300 placeholder:text-neutral-300"
            placeholder="홍길동"
          />
        </div>

        <div className="relative">
          <label htmlFor={fieldId("email")} className="t-label block mb-3">
            이메일 *
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-0 py-3 bg-transparent text-base border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors duration-300 placeholder:text-neutral-300"
            placeholder="example@email.com"
          />
        </div>
      </div>

      <div className="relative">
        <label htmlFor={fieldId("phone")} className="t-label block mb-3">
          전화번호
        </label>
        <input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          className="w-full px-0 py-3 bg-transparent text-base border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors duration-300 placeholder:text-neutral-300"
          placeholder="010-0000-0000"
        />
      </div>

      <div className="relative">
        <label htmlFor={fieldId("message")} className="t-label block mb-3">
          현재 상황 *
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          required
          rows={6}
          maxLength={4000}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className="w-full px-0 py-3 bg-transparent text-base border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors duration-300 resize-none placeholder:text-neutral-300"
          placeholder="매출 규모, 기존 기장 여부, 가장 급한 이슈를 세 줄 정도로 적어 주세요."
        />
      </div>

      {status === "error" && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="flex items-center gap-3 py-4 px-5 bg-red-50 border border-red-100">
          <span className="w-5 h-5 rounded-full border border-red-400 flex items-center justify-center flex-shrink-0">
            <span className="text-red-500 text-xs font-bold">!</span>
          </span>
          <p className="text-sm text-red-600">
            {errorMessage || "전송에 실패했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group w-full md:w-auto inline-flex items-center justify-center btn-blue rounded-[10px] px-12 py-4 text-sm font-medium tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "sending" ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              전송 중...
            </span>
          ) : (
            <>
              문의 보내기
              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
