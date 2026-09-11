"use client";

import { useSearchParams } from "next/navigation";
import { services } from "@/lib/data";
import { DEFAULT_STATE, deserializeStateFromParams, calculateEstimate, buildInquiryText } from "@/lib/pricing";
import ContactForm from "./contact-form";

/** Only the editable inquiry draft depends on the URL; the page can be prerendered. */
export default function ContactInquiry() {
  const query = useSearchParams();
  let message = query.get("message") || "";
  if (query.get("from") === "pricing") {
    const state = { ...DEFAULT_STATE, ...deserializeStateFromParams(new URLSearchParams(query.toString())) };
    message = buildInquiryText(state, calculateEstimate(state));
  } else {
    const service = services.find(item => item.title === query.get("type") || item.slug === query.get("service"));
    const context = [
      service && `관심 서비스: ${service.title}`,
      query.get("bottleneck") && `상담 목적: ${query.get("bottleneck")}`,
      query.get("output") && `필요한 결과물: ${query.get("output")}`,
    ].filter(Boolean).join("\n");
    if (context) message = `${context}\n\n${message}`;
  }
  return <ContactForm key={query.toString()} initialValues={message ? { message: message.slice(0, 4000) } : {}} />;
}
