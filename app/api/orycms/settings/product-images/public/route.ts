import { NextResponse } from "next/server";
import { getOryCMSSetting } from "@/settings";

const PRODUCT_IMAGES_SETTING_KEY = "product_images";

interface OryCMSProductImages {
  oryai: string | null;
  orycms: string | null;
  performx: string | null;
}

const EMPTY: OryCMSProductImages = { oryai: null, orycms: null, performx: null };

// GET /api/orycms/settings/product-images/public — the 3 product-box image
// URLs uploaded from OryCMS Settings, no session required (exempted in
// middleware.ts's PUBLIC_PRODUCT_IMAGES_GET_RE). Read by the marketing
// site's InternalProjectsSection to show admin-uploaded images instead of
// the static placeholder photos, falling back to null (site keeps its own
// static fallback) for any product not yet configured.
//
// Deliberately its OWN route rather than exposing the general
// /api/orycms/settings endpoint publicly — that one can hold arbitrary
// config and must stay admin-only.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await getOryCMSSetting(PRODUCT_IMAGES_SETTING_KEY);
    const value = (setting?.value as Partial<OryCMSProductImages> | undefined) ?? {};
    return NextResponse.json({
      success: true,
      data: { ...EMPTY, ...value },
    });
  } catch {
    return NextResponse.json({ success: true, data: EMPTY });
  }
}
