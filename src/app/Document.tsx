// TODO: Read CSS path from client manifest instead of hardcoding
// The CSS filename includes a hash that changes on content changes
// Manifest is at dist/client/.vite/manifest.json: ["src/client.tsx"].css[0]
export const Document: React.FC<{children: React.ReactNode}> = ({children}) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1"
			/>
			<title>Avalon Analytics</title>
			<link
				rel="stylesheet"
				href="/assets/client-DI2cLmb9.css"
			/>
			<link
				rel="modulepreload"
				href="/src/client.tsx"
			/>
		</head>
		<body>
			<div id="root">{children}</div>
			<script>import("/src/client.tsx")</script>
		</body>
	</html>
);
