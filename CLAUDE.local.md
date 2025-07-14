# Project: Avalon Analytics

This is a **RedwoodSDK (RWSDK)** framework project built on Cloudflare infrastructure.

## Framework Overview

RWSDK is a TypeScript framework for building fast, server-driven webapps with:

- Server-Side Rendering (SSR)
- React Server Components (RSC)
- Real-time capabilities
- Built on Cloudflare Workers

## Tech Stack

- **Framework**: RedwoodSDK 0.1.13
- **Runtime**: Cloudflare Workers
- **Build Tool**: Vite
- **Database**: Prisma with D1 (Cloudflare's SQLite)
- **Session Management**: Durable Objects
- **Authentication**: Passkey/WebAuthn
- **Storage**: R2 (Cloudflare object storage)
- **Package Manager**: pnpm

## Key Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm release` - Deploy to Cloudflare
- `pnpm migrate:dev` - Run database migrations locally
- `pnpm test` - Run tests with Vitest

## Project Structure

This follows the standard RWSDK starter template with:

- Server-side React components in `src/app/`
- Database models defined in Prisma schema
- Worker entry point at `src/worker.tsx`
- Client-side entry at `src/client.tsx`
