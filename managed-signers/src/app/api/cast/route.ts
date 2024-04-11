import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const cast = await neynarClient.publishCast(body.signer_uuid, body.text, {
      embeds: body.embed ? [body.embed] : [],
      channelId: "berachain",
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
