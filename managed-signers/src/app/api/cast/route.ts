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
  console.log(body.replyTo);
  try {
    let res;
    if (body.replyTo) {
      res = await neynarClient.lookUpCastByHashOrWarpcastUrl(
        body.replyTo,
        "url"
      );

      if (!res) {
        return NextResponse.json({ error: "Cast not found" }, { status: 404 });
      }
    }

    const cast = await neynarClient.publishCast(
      process.env.SIGNER_UUID,
      body.text,
      {
        embeds: body.embed
          ? [
              {
                url: body.embed,
              },
            ]
          : [],
        channelId: "berachain",
        replyTo: res?.cast.hash,
      }
    );

    return NextResponse.json(cast, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
