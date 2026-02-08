"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { KycStatus } from "@/hooks/use-kyc-status";
import { kycSubmitSchema } from "@/validations/kyc";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function VerifyPage() {
  const { getAccessToken } = usePrivy();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/auth/kyc", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setKycStatus(data.data.kycStatus);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Redirect if already verified
  useEffect(() => {
    if (kycStatus === "ACTIVE") {
      const timer = setTimeout(() => router.replace("/clubs"), 1500);
      return () => clearTimeout(timer);
    }
  }, [kycStatus, router]);

  // Poll for status updates when under review
  useEffect(() => {
    if (kycStatus !== "UNDER_REVIEW" && kycStatus !== "PENDING") return;

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [kycStatus, checkStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const result = kycSubmitSchema.safeParse(formData);
    if (result.success) {
      setFieldErrors({});
      return true;
    }
    const errors: Partial<Record<keyof FormData, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormData;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    }
    setFieldErrors(errors);
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/auth/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setKycStatus(data.data.kycStatus);
      } else {
        setSubmitError(data.error?.message || "Verification could not be started. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setKycStatus("NOT_STARTED");
    setFormData(initialFormData);
    setFieldErrors({});
    setSubmitError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="text-text-muted font-body">Loading...</div>
      </div>
    );
  }

  // Success state
  if (kycStatus === "ACTIVE") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="rounded-xl border border-glass-border bg-surface p-8">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <h2 className="font-display text-xl font-bold text-text">
            You&apos;re verified!
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-body">
            Redirecting to marketplace...
          </p>
        </div>
      </div>
    );
  }

  // Pending state
  if (kycStatus === "UNDER_REVIEW" || kycStatus === "PENDING") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="rounded-xl border border-glass-border bg-surface p-8">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <span
              className="inline-block h-2 w-2 rounded-full bg-coral animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>
          <p
            className="text-text-secondary font-body"
            aria-live="polite"
          >
            Verifying your identity...
          </p>
        </div>
      </div>
    );
  }

  // Failure state
  if (kycStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="rounded-xl border border-glass-border bg-surface p-8">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="font-display text-xl font-bold text-text">
            We couldn&apos;t verify your identity.
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-body">
            This can happen if the information didn&apos;t match. You can try
            again.
          </p>
          <Button onClick={handleRetry} className="mt-6 w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Form state (NOT_STARTED or null)
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text">
          Verify Your Identity
        </h1>
        <p className="mt-2 text-text-secondary font-body text-sm">
          Quick verification to get you started
        </p>
      </div>

      <div className="w-full rounded-xl border border-glass-border bg-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              error={fieldErrors.firstName}
              onChange={handleChange}
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              error={fieldErrors.lastName}
              onChange={handleChange}
            />
          </div>

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            error={fieldErrors.email}
            onChange={handleChange}
          />

          <FormField
            label="Date of Birth"
            name="dateOfBirth"
            placeholder="YYYY-MM-DD"
            value={formData.dateOfBirth}
            error={fieldErrors.dateOfBirth}
            onChange={handleChange}
          />

          <FormField
            label="Street Address"
            name="streetAddress"
            value={formData.streetAddress}
            error={fieldErrors.streetAddress}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="City"
              name="city"
              value={formData.city}
              error={fieldErrors.city}
              onChange={handleChange}
            />
            <FormField
              label="State / Province"
              name="state"
              value={formData.state}
              error={fieldErrors.state}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              error={fieldErrors.postalCode}
              onChange={handleChange}
            />
            <FormField
              label="Country (ISO)"
              name="country"
              placeholder="USA"
              value={formData.country}
              error={fieldErrors.country}
              onChange={handleChange}
              maxLength={3}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 font-body" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Verify Identity"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <Label
        htmlFor={name}
        className="mb-1 block text-xs font-semibold text-text-secondary font-body"
      >
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={
          error
            ? "border-red-500 focus-visible:ring-red-500/50 focus-visible:border-red-500"
            : "border-glass-border focus-visible:ring-coral/50 focus-visible:border-coral"
        }
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500 font-body">
          {error}
        </p>
      )}
    </div>
  );
}
