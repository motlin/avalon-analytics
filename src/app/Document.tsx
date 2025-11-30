// TODO: Read CSS paths from manifest instead of hardcoding
// CSS filenames include hashes that change on content changes
// Client CSS: dist/client/.vite/manifest.json: ["src/client.tsx"].css[0]
// Worker CSS: dist/client/assets/worker-entry-*.css (server component styles)
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
				rel="stylesheet"
				href="/assets/worker-entry-BqDAn6iu.css"
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
