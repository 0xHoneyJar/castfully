import { USERS } from "@/constants/users";
import neynarClient from "@/lib/neynarClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // const { searchParams } = new URL(req.url);
  // const fid = searchParams.get("fid");

  const fids = USERS.map((user) => user.fid);
  // console.log(fids);

  if (!fids) {
    return NextResponse.json({ error: "fids are required" }, { status: 400 });
  }

  try {
    const users = await neynarClient.fetchBulkUsers(
      fids.map((id) => Number(id))
    );

    return NextResponse.json(users.users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
