import { NextRequest, NextResponse } from "next/server";

const systemPassword = process.env.SYSTEM_PASSWORD;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("pass");

  if (password === systemPassword) {
    return NextResponse.json({ validPass: true }, { status: 200 });
  }
  return NextResponse.json({ validPass: false }, { status: 401 });
}
