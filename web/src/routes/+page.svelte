<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { cardStore } from '$lib/store';
	import { generateTypstCode } from '$lib/typst-generator';
	import { compileToSvg, compileToPdf, downloadPdf, initCompiler } from '$lib/pdf-compiler';
	import type { CardLayout, CardSize } from '$lib/types';

	let data = $state({ ...$cardStore });
	let svgPreview = $state('');
	let compileError = $state('');
	let isCompiling = $state(false);
	let isDownloading = $state(false);
	let compilerReady = $state(false);
	let activeTab = $state<'info' | 'contact' | 'social' | 'style'>('info');

	let debounceTimer: ReturnType<typeof setTimeout>;

	const unsubscribe = cardStore.subscribe((val) => {
		data = { ...val };
	});

	onMount(() => {
		initCompiler()
			.then(() => {
				compilerReady = true;
				scheduleCompile();
			})
			.catch((err: Error) => {
				compileError = `Compiler failed to load: ${err.message}`;
			});
		return () => unsubscribe();
	});

	function scheduleCompile() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(doCompile, 350);
	}

	async function doCompile() {
		if (!compilerReady) return;
		isCompiling = true;
		compileError = '';
		try {
			const code = generateTypstCode(data);
			svgPreview = await compileToSvg(code);
		} catch (err) {
			compileError = err instanceof Error ? err.message : String(err);
		} finally {
			isCompiling = false;
		}
	}

	function updateField<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
		cardStore.update((d) => ({ ...d, [key]: value }));
		scheduleCompile();
	}

	async function handleDownload() {
		isDownloading = true;
		try {
			const code = generateTypstCode(data);
			const pdf = await compileToPdf(code);
			const safeName = data.name.replace(/\s+/g, '-').toLowerCase() || 'business-card';
			downloadPdf(pdf, `${safeName}-card.pdf`);
		} catch (err) {
			compileError = err instanceof Error ? err.message : String(err);
		} finally {
			isDownloading = false;
		}
	}

	const layouts: { value: CardLayout; label: string; desc: string }[] = [
		{ value: 'bar', label: 'Accent Bar', desc: 'Vertical color bar on the left' },
		{ value: 'classic', label: 'Classic', desc: 'Left-aligned with rule divider' },
		{ value: 'centered', label: 'Centered', desc: 'Everything centered, pipe-separated contacts' },
		{ value: 'header', label: 'Header Block', desc: 'Colored block at top, contacts below' }
	];

	const sizes: { value: CardSize; label: string }[] = [
		{ value: 'us', label: 'US Standard (3.5" × 2")' },
		{ value: 'eu', label: 'EU Standard (85mm × 55mm)' },
		{ value: 'square', label: 'Square (2.5" × 2.5")' }
	];
</script>

<div class="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
	<header class="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
		<div>
			<h1 class="text-xl font-bold text-white">Business Card Generator</h1>
			<p class="text-xs text-gray-400 mt-0.5">Design and export to PDF with Typst</p>
		</div>
		<div class="flex gap-3 items-center">
			<button
				onclick={() => { cardStore.reset(); scheduleCompile(); }}
				class="text-xs text-gray-400 hover:text-gray-200 transition-colors"
			>
				Reset
			</button>
			<button
				onclick={handleDownload}
				disabled={isDownloading || !compilerReady}
				class="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
			>
				{#if isDownloading}
					<span class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
					Exporting...
				{:else}
					Download PDF
				{/if}
			</button>
		</div>
	</header>

	<div class="flex flex-1 overflow-hidden">
		<!-- Left Panel -->
		<aside class="w-80 border-r border-gray-800 flex flex-col overflow-hidden shrink-0">
			<div class="flex border-b border-gray-800 text-xs font-medium">
				{#each (['info', 'contact', 'social', 'style'] as const) as tab}
					<button
						onclick={() => (activeTab = tab)}
						class="flex-1 py-3 capitalize transition-colors {activeTab === tab
							? 'text-blue-400 border-b-2 border-blue-400 -mb-px'
							: 'text-gray-400 hover:text-gray-200'}"
					>
						{tab}
					</button>
				{/each}
			</div>

			<div class="flex-1 overflow-y-auto p-4 space-y-4">
				{#if activeTab === 'info'}
					<div>
						<label class="field-label">Full Name</label>
						<input value={data.name} oninput={(e) => updateField('name', e.currentTarget.value)} placeholder="Jane Doe" class="input" />
					</div>
					<div>
						<label class="field-label">Job Title</label>
						<input value={data.title} oninput={(e) => updateField('title', e.currentTarget.value)} placeholder="Software Engineer" class="input" />
					</div>
					<div>
						<label class="field-label">Company</label>
						<input value={data.company} oninput={(e) => updateField('company', e.currentTarget.value)} placeholder="Acme Corp" class="input" />
					</div>

				{:else if activeTab === 'contact'}
					<div>
						<label class="field-label">Email</label>
						<input value={data.email} oninput={(e) => updateField('email', e.currentTarget.value)} type="email" placeholder="jane@example.com" class="input" />
					</div>
					<div>
						<label class="field-label">Phone</label>
						<input value={data.phone} oninput={(e) => updateField('phone', e.currentTarget.value)} placeholder="+1 555 123 4567" class="input" />
					</div>
					<div>
						<label class="field-label">Website</label>
						<input value={data.website} oninput={(e) => updateField('website', e.currentTarget.value)} placeholder="janedoe.com" class="input" />
					</div>
					<div>
						<label class="field-label">Location</label>
						<input value={data.location} oninput={(e) => updateField('location', e.currentTarget.value)} placeholder="San Francisco, CA" class="input" />
					</div>

				{:else if activeTab === 'social'}
					<div>
						<label class="field-label">LinkedIn username</label>
						<input value={data.linkedin} oninput={(e) => updateField('linkedin', e.currentTarget.value)} placeholder="janedoe" class="input" />
					</div>
					<div>
						<label class="field-label">GitHub username</label>
						<input value={data.github} oninput={(e) => updateField('github', e.currentTarget.value)} placeholder="janedoe" class="input" />
					</div>
					<div>
						<label class="field-label">Twitter / X username</label>
						<input value={data.twitter} oninput={(e) => updateField('twitter', e.currentTarget.value)} placeholder="janedoe" class="input" />
					</div>

				{:else if activeTab === 'style'}
					<fieldset>
						<legend class="field-label mb-2">Layout</legend>
						<div class="space-y-2">
							{#each layouts as layout}
								<label class="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors {data.layout === layout.value ? 'bg-gray-800 ring-1 ring-blue-500' : ''}">
									<input type="radio" name="layout" value={layout.value} checked={data.layout === layout.value} onchange={() => updateField('layout', layout.value)} class="mt-0.5 accent-blue-500" />
									<div>
										<div class="text-sm text-white">{layout.label}</div>
										<div class="text-xs text-gray-400">{layout.desc}</div>
									</div>
								</label>
							{/each}
						</div>
					</fieldset>

					<fieldset>
						<legend class="field-label mb-2">Card Size</legend>
						<div class="space-y-1">
							{#each sizes as size}
								<label class="flex items-center gap-2 cursor-pointer py-1 text-sm">
									<input type="radio" name="size" value={size.value} checked={data.size === size.value} onchange={() => updateField('size', size.value)} class="accent-blue-500" />
									{size.label}
								</label>
							{/each}
						</div>
					</fieldset>

					<fieldset>
						<legend class="field-label mb-3">Colors</legend>
						<div class="space-y-3">
							<div class="flex items-center gap-3">
								<span class="text-xs text-gray-300 flex-1">Accent / Primary</span>
								<input type="color" value={'#' + data.primaryColor} oninput={(e) => updateField('primaryColor', e.currentTarget.value.replace('#', ''))} class="color-swatch" />
								<input value={data.primaryColor} oninput={(e) => { const v = e.currentTarget.value.replace('#',''); if (/^[0-9a-fA-F]{6}$/.test(v)) updateField('primaryColor', v); }} maxlength={7} class="input w-24 font-mono text-xs" placeholder="rrggbb" />
							</div>
							<div class="flex items-center gap-3">
								<span class="text-xs text-gray-300 flex-1">Text</span>
								<input type="color" value={'#' + data.textColor} oninput={(e) => updateField('textColor', e.currentTarget.value.replace('#', ''))} class="color-swatch" />
								<input value={data.textColor} oninput={(e) => { const v = e.currentTarget.value.replace('#',''); if (/^[0-9a-fA-F]{6}$/.test(v)) updateField('textColor', v); }} maxlength={7} class="input w-24 font-mono text-xs" placeholder="rrggbb" />
							</div>
							<div class="flex items-center gap-3">
								<span class="text-xs text-gray-300 flex-1">Background</span>
								<input type="color" value={'#' + data.bgColor} oninput={(e) => updateField('bgColor', e.currentTarget.value.replace('#', ''))} class="color-swatch" />
								<input value={data.bgColor} oninput={(e) => { const v = e.currentTarget.value.replace('#',''); if (/^[0-9a-fA-F]{6}$/.test(v)) updateField('bgColor', v); }} maxlength={7} class="input w-24 font-mono text-xs" placeholder="rrggbb" />
							</div>
						</div>
					</fieldset>
				{/if}
			</div>
		</aside>

		<!-- Right Panel: Preview -->
		<main class="flex-1 flex flex-col items-center justify-center bg-gray-900 p-8 overflow-auto">
			{#if !compilerReady && !compileError}
				<div class="text-center space-y-3">
					<div class="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p class="text-gray-400 text-sm">Loading Typst compiler…</p>
				</div>
			{:else if compileError}
				<div class="bg-red-950 border border-red-800 rounded-lg p-4 max-w-md w-full">
					<p class="text-red-400 text-sm font-medium mb-1">Compile error</p>
					<pre class="text-red-300 text-xs whitespace-pre-wrap break-all">{compileError}</pre>
				</div>
			{:else if isCompiling && !svgPreview}
				<div class="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
			{:else if svgPreview}
				<div class="space-y-4 w-full flex flex-col items-center">
					<p class="text-xs text-gray-500">Business card preview</p>
					<div
						class="shadow-2xl rounded overflow-hidden transition-opacity duration-200 {isCompiling ? 'opacity-60' : 'opacity-100'}"
						style="max-width: min(600px, 90vw);"
					>
						{@html svgPreview}
					</div>
					<p class="text-xs text-gray-600">Click "Download PDF" to export</p>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	:global(.field-label) {
		display: block;
		font-size: 0.75rem;
		font-weight: 500;
		color: #9ca3af;
		margin-bottom: 0.25rem;
	}
	:global(.input) {
		width: 100%;
		background: #1f2937;
		border: 1px solid #374151;
		border-radius: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.875rem;
		color: #f9fafb;
		outline: none;
		transition: border-color 0.15s;
	}
	:global(.input:focus) {
		border-color: #3b82f6;
	}
	:global(.input::placeholder) {
		color: #6b7280;
	}
	:global(.color-swatch) {
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		cursor: pointer;
		border: 1px solid #4b5563;
		background: transparent;
		padding: 0.125rem;
	}
</style>
