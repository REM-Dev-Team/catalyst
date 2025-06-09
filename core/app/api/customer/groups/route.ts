import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const authToken = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (!authToken) {
    return NextResponse.json(null);
  }

  const response = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': authToken,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch customer groups: ${response.statusText}`);
  }

  // `/v2/customer_groups` endpoint returns a `204 No Content` response if there are no customer groups
  if (response.status === 204) {
    return NextResponse.json([]);
  }

  const jsonResponse: unknown = await response.json();

  return NextResponse.json(jsonResponse);
}
