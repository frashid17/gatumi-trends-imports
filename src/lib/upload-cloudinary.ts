type SignPayload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string | null;
};

async function fetchSignPayload(): Promise<SignPayload> {
  const signRes = await fetch("/api/admin/cloudinary-sign", {
    method: "POST",
    credentials: "include",
  });
  const raw = await signRes.text();
  if (!signRes.ok) {
    let message = raw || `Sign request failed (${signRes.status})`;
    try {
      const j = JSON.parse(raw) as { error?: string };
      if (j.error) message = j.error;
    } catch {
      /* use message */
    }
    throw new Error(message);
  }
  return JSON.parse(raw) as SignPayload;
}

/** Ask the server (admin session) for a signature, then upload from the browser. API secret never leaves the server. */
export async function uploadImageToCloudinary(file: Blob, fileName: string): Promise<string> {
  const { cloudName, apiKey, timestamp, signature, folder } = await fetchSignPayload();

  const body = new FormData();
  body.append("file", file, fileName || "product.jpg");
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  if (folder) {
    body.append("folder", folder);
  }

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Cloudinary upload failed (${res.status})`);
  }

  const data = JSON.parse(text) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary response missing secure_url");
  }
  return data.secure_url;
}
