declare module 'cloudflare:test' {
	export const env: any;
	export function applyD1Migrations(db: any, migrations: any): Promise<void>;
}
