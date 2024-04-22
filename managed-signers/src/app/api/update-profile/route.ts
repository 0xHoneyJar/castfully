import { USERS } from "@/constants/users";
import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { fid } = body;

  if (!fid) {
    return NextResponse.json({ error: "FID not found" }, { status: 404 });
  }

  const uuid = USERS.find((user) => user.fid === fid)?.uuid;

  if (!uuid) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const cast = await neynarClient.updateUser(uuid, {
      bio: body.bio,
      pfpUrl: body.pfpUrl,
    });

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
