import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUploadAuthParams } from "@imagekit/next/server";

import ImageKit from "@imagekit/nodejs";

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId)
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error: any) {
    console.log("Error", error.message);
    return NextResponse.json(
      { error: "Failed to generate authentication parameters for imagekit" },
      { status: 500 },
    );
  }
}
