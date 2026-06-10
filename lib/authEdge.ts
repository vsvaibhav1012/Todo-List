import { jwtVerify } from "jose";

const ACCESS_SECRET = () =>
  new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export async function verifyAccessTokenEdge(
  token: string
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, await ACCESS_SECRET());
  return payload as unknown as AccessTokenPayload;
}
