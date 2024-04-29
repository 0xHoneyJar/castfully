import { NextRequest, NextResponse } from "next/server";
import { parse } from "node-html-parser";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const root = parse(html);

    const ogTitle = root
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content");
    const ogDescription = root
      .querySelector('meta[property="og:description"]')
      ?.getAttribute("content");
    const ogImage = root
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content");

    return NextResponse.json({
      title: ogTitle,
      description: ogDescription,
      image: ogImage,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metadata" });
  }
}
