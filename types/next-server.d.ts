// Type definitions for Next.js server-side modules
declare module 'next/server' {
  export class NextResponse {
    static json(data: any, init?: ResponseInit): NextResponse;
    static error(): NextResponse;
    static redirect(url: string | URL): NextResponse;
    static next(): NextResponse;
  }
}
