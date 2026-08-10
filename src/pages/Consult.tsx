import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/useToast";
import {
  Camera,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileCheck,
  Send,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ConsultationTicket {
  id: string;
  crop_category: string;
  problem_description: string;
  image_urls: string[];
  status: "pending" | "under_review" | "responded" | "closed";
  created_at: string;
  updated_at: string;
}

interface UploadResult {
  path: string;
  url: string;
}

type SubmitState = "IDLE" | "UPLOADING" | "SUBMITTING" | "SUCCESS" | "ERROR";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 4;
const UPLOAD_RETRY_ATTEMPTS = 3;
const UPLOAD_RETRY_BASE_DELAY_MS = 1000;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;

const CROP_CATEGORIES = [
  "maize",
  "cassava",
  "yam",
  "rice",
  "cocoa",
  "cashew",
  "sesame",
  "soybean",
  "cowpea",
  "other",
] as const;

type CropCategory = (typeof CROP_CATEGORIES)[number];

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: typeof Clock; labelKey: string }
> = {
  pending: {
    color: "#D4AF37",
    icon: Clock,
    labelKey: "consult_ticket_pending",
  },
  under_review: {
    color: "#4A90D9",
    icon: AlertCircle,
    labelKey: "consult_ticket_under_review",
  },
  responded: {
    color: "#0B6623",
    icon: CheckCircle2,
    labelKey: "consult_ticket_responded",
  },
  closed: {
    color: "#6B7280",
    icon: FileCheck,
    labelKey: "consult_ticket_closed",
  },
};

// ---------------------------------------------------------------------------
// Image validation — strict JPEG/PNG, max 5MB
// ---------------------------------------------------------------------------
function validateImage(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: "too_large" };
  }
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { valid: false, error: "invalid_type" };
  }
  return { valid: true };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Consult — Expert Triage Surface
// ---------------------------------------------------------------------------
export default function Consult() {
  const { t } = useTranslation();
  const { success, error: toastError, warning } = useToast();

  // Form state — typed fields
  const [cropCategory, setCropCategory] = useState<CropCategory | "">("");
  const [problemDescription, setProblemDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>("IDLE");
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------------
  // Fetch user's existing consultation tickets
  // -----------------------------------------------------------------------
  const {
    data: tickets,
    isLoading: ticketsLoading,
  } = useQuery<ConsultationTicket[]>({
    queryKey: ["consultation-tickets"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("consultation_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data ?? []) as ConsultationTicket[];
    },
    staleTime: 30_000,
  });

  // -----------------------------------------------------------------------
  // Image selection — strict validation, 5MB max, JPEG/PNG only
  // -----------------------------------------------------------------------
  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      const remaining = MAX_IMAGES - selectedFiles.length;
      if (remaining <= 0) {
        warning(t.consult_image_too_large);
        return;
      }

      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of files.slice(0, remaining)) {
        const validation = validateImage(file);
        if (!validation.valid) {
          if (validation.error === "too_large") {
            toastError(`${file.name}: ${t.consult_image_too_large}`);
          } else {
            toastError(`${file.name}: ${t.consult_image_too_large}`);
          }
          continue;
        }
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);

      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [selectedFiles.length, t, toastError, warning]
  );

  // -----------------------------------------------------------------------
  // Remove image — revoke object URL to prevent memory leaks
  // -----------------------------------------------------------------------
  const handleRemoveImage = useCallback(
    (index: number) => {
      const url = previewUrls[index];
      if (url) URL.revokeObjectURL(url);
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    },
    [previewUrls]
  );

  // -----------------------------------------------------------------------
  // Upload with exponential backoff retry
  // -----------------------------------------------------------------------
  // Protects against 3G drops mid-upload. Retries with exponential backoff
  // (1s → 2s → 4s) up to UPLOAD_RETRY_ATTEMPTS times. Saves to the
  // authenticated user's partition: {auth.uid()}/filename.ext
  const uploadWithRetry = useCallback(
    async (file: File, userId: string, attempt = 1): Promise<UploadResult> => {
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const path = `${userId}/${fileName}`;

        const { error } = await supabase.storage
          .from("crop-images")
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (error) throw error;

        const {
          data: urlData,
        } = supabase.storage.from("crop-images").getPublicUrl(path);

        return { path, url: urlData.publicUrl ?? "" };
      } catch (err) {
        if (attempt < UPLOAD_RETRY_ATTEMPTS) {
          // Exponential backoff: base * 2^(attempt-1) — 1s, 2s, 4s
          const backoffMs =
            UPLOAD_RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await delay(backoffMs);
          return uploadWithRetry(file, userId, attempt + 1);
        }
        throw err;
      }
    },
    []
  );

  // -----------------------------------------------------------------------
  // Form submission — upload images then insert ticket
  // -----------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!cropCategory.trim() || !problemDescription.trim()) return;

    setSubmitState("UPLOADING");
    setSubmitError("");

    try {
      // 1. Validate session
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) {
        toastError(t.error_unauthorized);
        setSubmitState("ERROR");
        return;
      }

      // 2. Upload images with retry — partial upload is acceptable
      const imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setSubmitState("UPLOADING");
        for (const file of selectedFiles) {
          try {
            const result = await uploadWithRetry(file, user.id);
            imageUrls.push(result.url);
          } catch {
            // Connection drop or exhausted retries — report but continue
            toastError(`${t.consult_upload_failed}: ${file.name}`);
          }
        }
      }

      // 3. Submit consultation ticket to database
      setSubmitState("SUBMITTING");
      const { error: insertErr } = await supabase
        .from("consultation_tickets")
        .insert({
          user_id: user.id,
          crop_category: cropCategory,
          problem_description: problemDescription,
          image_urls: imageUrls,
          status: "pending",
        });

      if (insertErr) throw insertErr;

      setSubmitState("SUCCESS");
      success(t.consult_success);

      // 4. Reset form state
      setCropCategory("");
      setProblemDescription("");
      // Revoke preview URLs to prevent memory leaks
      for (const url of previewUrls) URL.revokeObjectURL(url);
      setSelectedFiles([]);
      setPreviewUrls([]);

      // TanStack Query will auto-refetch tickets due to staleTime
    } catch (err) {
      console.error("Consultation submit error:", err);
      setSubmitState("ERROR");
      setSubmitError(t.error_generic);
      toastError(t.error_generic);
    }
  }, [
    cropCategory,
    problemDescription,
    selectedFiles,
    previewUrls,
    uploadWithRetry,
    t,
    success,
    toastError,
  ]);

  // -----------------------------------------------------------------------
  // Clear error state and allow retry
  // -----------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    setSubmitState("IDLE");
    setSubmitError("");
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  const isSubmitting =
    submitState === "UPLOADING" || submitState === "SUBMITTING";

  return (
    <div className="page-container">
      {/* Header */}
      <header className="consult-header">
        <h1 className="consult-title">{t.consult_title}</h1>
      </header>

      {/* New request form */}
      <section
        className="consult-form-section"
        aria-label={t.consult_new_request}
      >
        <h2 className="consult-section-title">{t.consult_new_request}</h2>

        {/* Crop category selector */}
        <label className="consult-field">
          <span className="consult-label">{t.consult_crop_label}</span>
          <div className="consult-select-wrapper">
            <select
              value={cropCategory}
              onChange={(e) =>
                setCropCategory(e.target.value as CropCategory | "")
              }
              className="consult-select"
              aria-label={t.consult_crop_label}
              style={{ touchAction: "manipulation" }}
            >
              <option value="">{t.consult_crop_placeholder}</option>
              {CROP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="consult-select-icon" />
          </div>
        </label>

        {/* Problem description */}
        <label className="consult-field">
          <span className="consult-label">{t.consult_problem_label}</span>
          <textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder={t.consult_problem_placeholder}
            className="consult-textarea"
            rows={4}
            maxLength={2000}
            aria-label={t.consult_problem_label}
          />
        </label>

        {/* Photo upload — JPEG/PNG, max 5MB */}
        <label className="consult-field">
          <span className="consult-label">{t.consult_photo_label}</span>
          <p className="consult-hint">{t.consult_photo_hint}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleImageSelect}
            className="consult-file-input"
            aria-label={t.consult_photo_label}
          />

          {/* Upload trigger button — 48px touch target */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedFiles.length >= MAX_IMAGES}
            className="consult-upload-btn"
            style={{ touchAction: "manipulation" }}
          >
            <Camera size={20} />
            <span>
              {t.consult_photo_label} ({selectedFiles.length}/{MAX_IMAGES})
            </span>
          </button>

          {/* Image previews with remove buttons */}
          {previewUrls.length > 0 && (
            <div className="consult-previews">
              {previewUrls.map((url, i) => (
                <div key={url} className="consult-preview-item">
                  <img src={url} alt="" className="consult-preview-img" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="consult-preview-remove"
                    aria-label={t.delete}
                    style={{ touchAction: "manipulation" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </label>

        {/* Error banner with retry button — actionable on connection drops */}
        {submitState === "ERROR" && submitError && (
          <div className="consult-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{submitError}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="consult-retry-btn"
              style={{ touchAction: "manipulation" }}
            >
              {t.consult_try_again}
            </button>
          </div>
        )}

        {/* Success banner */}
        {submitState === "SUCCESS" && (
          <div className="consult-success-banner" role="status">
            <CheckCircle2 size={16} />
            <span>{t.consult_success}</span>
          </div>
        )}

        {/* Submit button — 48px touch target, green primary */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !cropCategory.trim() || !problemDescription.trim()}
          className="consult-submit-btn"
          style={{ touchAction: "manipulation" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>
                {submitState === "UPLOADING"
                  ? t.loading
                  : t.consult_submitting}
              </span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>{t.consult_submit}</span>
            </>
          )}
        </button>
      </section>

      {/* Previous tickets */}
      <section
        className="consult-tickets-section"
        aria-label={t.consult_my_tickets}
      >
        <h2 className="consult-section-title">{t.consult_my_tickets}</h2>

        {ticketsLoading ? (
          <div className="consult-tickets-loading">{t.loading}</div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="consult-tickets-empty">
            <FileCheck size={32} className="text-gray-400" />
            <p>{t.no_results}</p>
          </div>
        ) : (
          <div className="consult-tickets-list">
            {tickets.map((ticket) => {
              const cfg =
                STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
              if (!cfg) return null;
              const StatusIcon = cfg.icon;
              const statusLabel =
                t[cfg.labelKey as keyof typeof t] ?? ticket.status;

              return (
                <div key={ticket.id} className="consult-ticket-card">
                  <div className="consult-ticket-header">
                    <span className="consult-ticket-crop">
                      {ticket.crop_category}
                    </span>
                    <span
                      className="consult-ticket-status"
                      style={{
                        backgroundColor: `${cfg.color}20`,
                        color: cfg.color,
                      }}
                    >
                      <StatusIcon size={14} />
                      {statusLabel}
                    </span>
                  </div>
                  <p className="consult-ticket-problem">
                    {ticket.problem_description}
                  </p>
                  {ticket.image_urls.length > 0 && (
                    <div className="consult-ticket-images">
                      {ticket.image_urls.slice(0, 3).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="consult-ticket-thumb"
                        />
                      ))}
                      {ticket.image_urls.length > 3 && (
                        <span className="consult-ticket-more">
                          +{ticket.image_urls.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="consult-ticket-footer">
                    <span className="consult-ticket-date">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
