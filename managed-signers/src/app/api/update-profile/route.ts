import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (!process.env.SIGNER_UUID) {
    return NextResponse.json(
      { error: "Signer UUID not found" },
      { status: 500 }
    );
  }

  try {
    const cast = await neynarClient.updateUser(process.env.SIGNER_UUID, {
      bio: body.bio,
      pfpUrl: body.pfpUrl,
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
