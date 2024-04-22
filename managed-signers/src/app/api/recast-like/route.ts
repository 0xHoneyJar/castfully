import { USERS } from "@/constants/users";
import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const fid = body.fid;

  if (!fid) {
    return NextResponse.json({ error: "Fid not found" }, { status: 404 });
  }

  const uuid = USERS.find((x) => x.fid === fid)?.uuid;

  if (!uuid) {
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
      uuid,
      "like",
      res?.cast.hash || ""
    );

    const recast = await neynarClient.publishReactionToCast(
      uuid,
      "recast",
      res?.cast.hash || ""
    );

    // const other = await neynarClient.fetchReactionsForCast(
    //   res?.cast.hash,
    //   "all"
    // );

    // console.log(other);

    return NextResponse.json({ like, recast }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
