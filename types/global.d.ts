import 'next';

declare module 'next' {
  export * from 'next/types';
  export { default } from 'next/types';
}

declare module 'next/server' {
  export * from 'next/types';
  export { default } from 'next/types';
}

declare module 'next/dist/server/web/spec-extension/response' {
  export * from 'next/types';
  export { default } from 'next/types';
}
