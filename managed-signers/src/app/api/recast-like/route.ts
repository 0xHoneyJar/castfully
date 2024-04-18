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
    let res;
    if (body.url) {
      res = await neynarClient.lookUpCastByHashOrWarpcastUrl(body.url, "url");
    }

    console.log(res);

    if (!res) {
      return NextResponse.json({ error: "Cast not found" }, { status: 404 });
    }

    const like = await neynarClient.publishReactionToCast(
      process.env.SIGNER_UUID,
      "like",
      res?.cast.hash || ""
    );

    const recast = await neynarClient.publishReactionToCast(
      process.env.SIGNER_UUID,
      "recast",
      res?.cast.hash || ""
    );

    return NextResponse.json({ like, recast }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
