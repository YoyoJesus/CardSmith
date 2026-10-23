<script lang="ts">
	import { previewSvgBlob } from '$lib/svg-preview';

	let {
		showCode,
		typstCode,
		svgPreview,
		isCompiling,
		compilerReady,
		compileError,
		onRetry,
	}: {
		showCode: boolean;
		typstCode: string;
		svgPreview: string;
		isCompiling: boolean;
		compilerReady: boolean;
		compileError: string;
		onRetry: () => void;
	} = $props();

	// An <img> never runs scripts or follows links in the compiler's SVG, so it is safe for user-controlled content.
	let previewUrl = $state('');
	$effect(() => {
		if (!svgPreview) {
			previewUrl = '';
			return;
		}
		const url = URL.createObjectURL(previewSvgBlob(svgPreview));
		previewUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	let copyStatus = $state<'idle' | 'copied' | 'failed'>('idle');
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(typstCode);
			copyStatus = 'copied';
		} catch {
			copyStatus = 'failed';
		}
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => (copyStatus = 'idle'), 1500);
	}
</script>

<div
	class="flex h-[calc(100vh-10rem)] flex-col items-center overflow-hidden rounded-lg bg-gray-500 p-4 shadow lg:h-full"
>
	<h2 class="mb-4 text-lg font-semibold text-white">
		{showCode ? 'Typst Code' : 'Business Card Preview'}
	</h2>

	{#if showCode}
		<div class="relative min-h-0 w-full flex-1">
			<button class="secondary absolute top-2 right-2 text-xs" onclick={copyToClipboard} aria-live="polite"
				>{copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy'}</button
			>
			<pre
				class="h-full w-full overflow-auto rounded-lg bg-gray-900 p-4 text-xs whitespace-pre-wrap text-gray-100"><code
					>{typstCode}</code
				></pre>
		</div>
	{:else}
		<div class="flex min-h-0 w-full flex-1 items-center justify-center overflow-auto" aria-live="polite">
			{#if compileError}
				<div class="w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
					<p class="mb-1 text-sm font-medium text-red-700">Compile error</p>
					<pre class="text-xs break-all whitespace-pre-wrap text-red-600">{compileError}</pre>
					{#if !compilerReady}
						<button onclick={onRetry} class="danger mt-3 text-sm">Retry compiler</button>
					{/if}
				</div>
			{:else if !compilerReady}
				<div class="flex flex-col items-center gap-3 text-gray-200">
					<div class="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
					<span>Loading Typst compiler...</span>
				</div>
			{:else if previewUrl}
				<div
					class="w-full overflow-hidden rounded bg-white shadow-lg transition-opacity duration-200 {isCompiling
						? 'opacity-60'
						: ''}"
					style="max-width: min(560px, 100%);"
				>
					<img src={previewUrl} alt="Business card preview" class="block h-auto w-full" />
				</div>
			{:else if isCompiling}
				<span class="text-gray-200">Compiling preview...</span>
			{:else}
				<span class="text-gray-200">Preview will appear here</span>
			{/if}
		</div>
	{/if}
</div>
