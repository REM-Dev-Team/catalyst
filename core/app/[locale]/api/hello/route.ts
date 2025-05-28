import { NextResponse } from 'next/server';

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ locale: string }> },
) => {
  const { locale } = await params;

  console.log('api/hello', locale);

  return NextResponse.json({ message: 'Hello, world!' });
};
