"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";
import { uploadImageToCloudinary } from "@/lib/upload-cloudinary";

type Props = {
  defaultUrl: string;
};

export function ProductImageField({ defaultUrl }: Props) {
  const inputId = useId();
  const [url, setUrl] = useState(defaultUrl);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const cropCompleteRef = useRef<Area | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/cloudinary-sign", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ configured: false })))
      .then((d: { configured?: boolean }) => {
        if (!cancelled) setCloudinaryReady(!!d.configured);
      })
      .catch(() => {
        if (!cancelled) setCloudinaryReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    cropCompleteRef.current = pixels;
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const closeCropper = () => {
    setCropOpen(false);
    setFile(null);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
    cropCompleteRef.current = null;
  };

  const onPickFile = (f: File | null) => {
    setError(null);
    if (!f || !f.type.startsWith("image/")) {
      setError("Choose an image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const next = URL.createObjectURL(f);
    setFile(f);
    setObjectUrl(next);
    setCropOpen(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const runUpload = async (blob: Blob, name: string) => {
    setBusy(true);
    setError(null);
    try {
      const secureUrl = await uploadImageToCloudinary(blob, name);
      setUrl(secureUrl);
      closeCropper();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const handleUploadOriginal = () => {
    if (!file || !cloudinaryReady) return;
    void runUpload(file, file.name || "product.jpg");
  };

  const handleUploadCropped = async () => {
    if (!objectUrl || !cloudinaryReady) return;
    const pixels = cropCompleteRef.current ?? croppedAreaPixels;
    if (!pixels) {
      setError("Adjust the crop, then try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const blob = await getCroppedImageBlob(objectUrl, pixels);
      const name = (file?.name?.replace(/\.[^.]+$/, "") ?? "product") + "-cropped.jpg";
      const secureUrl = await uploadImageToCloudinary(blob, name);
      setUrl(secureUrl);
      closeCropper();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crop or upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="image_url" value={url} readOnly />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="text-[var(--foreground-muted)]">Image URL</span>
          <input
            id={inputId}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="ui-input"
            placeholder={
              cloudinaryReady
                ? "Upload below, or paste an image URL"
                : "Paste an image URL (add Cloudinary API keys in .env to upload from here)"
            }
            autoComplete="off"
          />
        </label>
        {cloudinaryReady ? (
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--gold)]/45 hover:bg-[var(--nav-hover)] sm:shrink-0">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            Choose file
          </label>
        ) : null}
      </div>

      {url ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, any host */}
          <img src={url} alt="" className="mx-auto max-h-48 w-auto max-w-full object-contain" />
        </div>
      ) : null}

      {!cloudinaryReady ? (
        <p className="text-xs text-[var(--foreground-muted)]">
          Server-side signing: set{" "}
          <code className="rounded bg-[var(--surface-elevated)] px-1 py-0.5 text-[11px]">
            CLOUDINARY_CLOUD_NAME
          </code>
          ,{" "}
          <code className="rounded bg-[var(--surface-elevated)] px-1 py-0.5 text-[11px]">
            CLOUDINARY_API_KEY
          </code>
          , and{" "}
          <code className="rounded bg-[var(--surface-elevated)] px-1 py-0.5 text-[11px]">
            CLOUDINARY_API_SECRET
          </code>{" "}
          from your Cloudinary dashboard (API Keys). Optional:{" "}
          <code className="text-[11px]">CLOUDINARY_UPLOAD_FOLDER</code>. The API secret stays on the
          server.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/35 bg-red-950/35 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {cropOpen && objectUrl ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${inputId}-crop-title`}
        >
          <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-y-auto overscroll-contain rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-xl">
            <div className="shrink-0 border-b border-[var(--border)] px-4 py-3">
              <h2 id={`${inputId}-crop-title`} className="font-display text-lg font-semibold text-[var(--foreground)]">
                Adjust image
              </h2>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Drag to reframe. Use <strong className="text-[var(--foreground-muted)]">Upload original</strong> to
                skip cropping.
              </p>
            </div>
            {/* Cap width so 4:5 preview doesn’t eat the whole viewport and hide the action bar */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[min(100%,18rem)] bg-[var(--background-deep)] sm:max-w-[20rem]">
              <Cropper
                image={objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="shrink-0 border-t border-[var(--border)] px-4 py-3">
              <label className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                <span className="shrink-0">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-2 w-full accent-[var(--gold)]"
                />
              </label>
            </div>
            <div className="sticky bottom-0 z-10 flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-solid)] p-4 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={closeCropper}
                disabled={busy}
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--nav-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadOriginal}
                disabled={busy}
                className="rounded-xl border border-[var(--gold)]/50 bg-[var(--gold)]/10 px-4 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/20 disabled:opacity-50"
              >
                {busy ? "Uploading…" : "Upload original"}
              </button>
              <button
                type="button"
                onClick={() => void handleUploadCropped()}
                disabled={busy}
                className="rounded-xl bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[var(--on-gold)] transition hover:bg-[var(--gold-hover)] disabled:opacity-50"
              >
                {busy ? "Uploading…" : "Confirm crop & upload"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
