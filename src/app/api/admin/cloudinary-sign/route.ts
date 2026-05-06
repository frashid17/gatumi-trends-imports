import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdminUser } from "@/lib/admin";

function cloudinaryEnvOk(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Admin-only: whether signed uploads are configured. */
export async function GET() {
  const user = await currentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ configured: cloudinaryEnvOk() });
}

/** Admin-only: params for direct browser upload to Cloudinary (signature hides API secret). */
export async function POST() {
  const user = await currentUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    return NextResponse.json(
      {
        error:
          "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (from Cloudinary dashboard → API Keys).",
      },
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const folderRaw = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim();
  const params: Record<string, string | number> = { timestamp };
  if (folderRaw) {
    params.folder = folderRaw;
  }

  const signature = cloudinary.utils.api_sign_request(params, api_secret);

  return NextResponse.json({
    cloudName: cloud_name,
    apiKey: api_key,
    timestamp,
    signature,
    folder: folderRaw || null,
  });
}
