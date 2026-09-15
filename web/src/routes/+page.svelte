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
	let leftTab = $state<'info' | 'contact' | 'social' | 'style'>('info');
	let rightTab = $state<'preview' | 'typst'>('preview');
	let typstCopied = $state(false);
	let compileRequest = 0;

	let debounceTimer: ReturnType<typeof setTimeout>;

	const unsubscribe = cardStore.subscribe((val) => {
		data = { ...val };
	});

	onMount(() => {
		void initializeCompiler();
		return () => unsubscribe();
	});

	async function initializeCompiler() {
		compilerReady = false;
		compileError = '';
		try {
			await initCompiler();
			compilerReady = true;
			scheduleCompile();
		} catch (err) {
			compileError = `Compiler failed to load: ${err instanceof Error ? err.message : String(err)}`;
		}
	}

	function scheduleCompile() {
		clearTimeout(debounceTimer);
		const request = ++compileRequest;
		debounceTimer = setTimeout(() => doCompile(request), 350);
	}

	async function doCompile(request: number) {
		if (!compilerReady) return;
		isCompiling = true;
		compileError = '';
		try {
			const preview = await compileToSvg(generateTypstCode(data));
			if (request === compileRequest) svgPreview = preview;
		} catch (err) {
			if (request === compileRequest) {
				compileError = err instanceof Error ? err.message : String(err);
			}
		} finally {
			if (request === compileRequest) isCompiling = false;
		}
	}

	function updateField<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
		cardStore.update((d) => ({ ...d, [key]: value }));
		scheduleCompile();
	}

	async function handleDownload() {
		isDownloading = true;
		try {
			const pdf = await compileToPdf(generateTypstCode(data));
			const safeName = data.name.replace(/\s+/g, '-').toLowerCase() || 'business-card';
			downloadPdf(pdf, `${safeName}-card.pdf`);
		} catch (err) {
			compileError = err instanceof Error ? err.message : String(err);
		} finally {
			isDownloading = false;
		}
	}

	async function copyTypst() {
		await navigator.clipboard.writeText(generateTypstCode(data));
		typstCopied = true;
		setTimeout(() => (typstCopied = false), 1800);
	}

	function saveTypst() {
		const safeName = data.name.replace(/\s+/g, '-').toLowerCase() || 'business-card';
		const blob = new Blob([generateTypstCode(data)], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${safeName}-card.typ`;
		a.click();
		URL.revokeObjectURL(url);
	}

	const layouts: { value: CardLayout; label: string; desc: string }[] = [
		{ value: 'bar', label: 'Accent Bar', desc: 'Vertical color bar on the left' },
		{ value: 'classic', label: 'Classic', desc: 'Left-aligned with rule divider' },
		{ value: 'centered', label: 'Centered', desc: 'Everything centered' },
		{ value: 'header', label: 'Header Block', desc: 'Colored block at top' }
	];

	const sizes: { value: CardSize; label: string }[] = [
		{ value: 'us', label: 'US Standard (3.5" × 2")' },
		{ value: 'eu', label: 'EU Standard (85mm × 55mm)' },
		{ value: 'square', label: 'Square (2.5" × 2.5")' }
	];
</script>

<svelte:head>
	<title>CardSmith | Business Card Maker</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 flex flex-col lg:h-screen lg:overflow-hidden">

	<!-- Header -->
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-2">
			<h1 class="text-2xl font-bold text-gray-900">CardSmith</h1>
			<div class="flex flex-wrap gap-2">
				<button onclick={() => { cardStore.reset(); scheduleCompile(); }} class="secondary">Reset</button>
				<button onclick={() => (rightTab = rightTab === 'preview' ? 'typst' : 'preview')} class="secondary">
					{rightTab === 'preview' ? 'Show code' : 'Show preview'}
				</button>
				<button onclick={saveTypst} class="secondary">Save as Typst</button>
				<button onclick={handleDownload} disabled={isDownloading || !compilerReady} class="primary">
					{isDownloading ? 'Generating...' : 'Download PDF'}
				</button>
			</div>
		</div>
	</header>

	<!-- Main two-column layout -->
	<main class="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:flex-1 lg:min-h-0">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-full lg:min-h-0">

		<!-- LEFT PANEL -->
		<div class="bg-white rounded-lg shadow p-6 flex flex-col overflow-hidden max-h-[calc(100vh-10rem)] lg:max-h-none lg:h-full">
			<!-- Tabs -->
			<div class="flex flex-wrap gap-2 mb-6 border-b pb-4">
				{#each (['info', 'contact', 'social', 'style'] as const) as tab}
					<button
						onclick={() => (leftTab = tab)}
						class="px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors {leftTab === tab
							? 'bg-blue-600 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					>
						{tab}
					</button>
				{/each}
			</div>

			<!-- Form content -->
			<div class="flex-1 overflow-y-auto space-y-5 pr-1">
				{#if leftTab === 'info'}
					<div>
						<label for="full-name" class="lbl">Full Name</label>
						<input id="full-name" value={data.name} oninput={(e) => updateField('name', e.currentTarget.value)} placeholder="Jane Doe" class="inp" />
					</div>
					<div>
						<label for="job-title" class="lbl">Job Title</label>
						<input id="job-title" value={data.title} oninput={(e) => updateField('title', e.currentTarget.value)} placeholder="Software Engineer" class="inp" />
					</div>
					<div>
						<label for="company" class="lbl">Company <span class="optional">(optional)</span></label>
						<input id="company" value={data.company} oninput={(e) => updateField('company', e.currentTarget.value)} placeholder="Acme Corp" class="inp" />
					</div>

				{:else if leftTab === 'contact'}
					<div>
						<label for="email" class="lbl">Email</label>
						<input id="email" value={data.email} oninput={(e) => updateField('email', e.currentTarget.value)} type="email" placeholder="jane@example.com" class="inp" />
					</div>
					<div>
						<label for="phone" class="lbl">Phone <span class="optional">(optional)</span></label>
						<input id="phone" value={data.phone} oninput={(e) => updateField('phone', e.currentTarget.value)} placeholder="+1 555 123 4567" class="inp" />
					</div>
					<div>
						<label for="website" class="lbl">Website <span class="optional">(optional)</span></label>
						<input id="website" value={data.website} oninput={(e) => updateField('website', e.currentTarget.value)} placeholder="janedoe.com" class="inp" />
					</div>
					<div>
						<label for="location" class="lbl">Location <span class="optional">(optional)</span></label>
						<input id="location" value={data.location} oninput={(e) => updateField('location', e.currentTarget.value)} placeholder="San Francisco, CA" class="inp" />
					</div>

				{:else if leftTab === 'social'}
					<div>
						<label for="linkedin" class="lbl">LinkedIn username <span class="optional">(optional)</span></label>
						<input id="linkedin" value={data.linkedin} oninput={(e) => updateField('linkedin', e.currentTarget.value)} placeholder="janedoe" class="inp" />
					</div>
					<div>
						<label for="github" class="lbl">GitHub username <span class="optional">(optional)</span></label>
						<input id="github" value={data.github} oninput={(e) => updateField('github', e.currentTarget.value)} placeholder="janedoe" class="inp" />
					</div>
					<div>
						<label for="twitter" class="lbl">Twitter / X username <span class="optional">(optional)</span></label>
						<input id="twitter" value={data.twitter} oninput={(e) => updateField('twitter', e.currentTarget.value)} placeholder="janedoe" class="inp" />
					</div>

				{:else if leftTab === 'style'}
					<div>
						<p class="lbl mb-3">Layout</p>
						<div class="space-y-2">
							{#each layouts as layout}
								<label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors {data.layout === layout.value ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}">
									<input type="radio" name="layout" value={layout.value} checked={data.layout === layout.value} onchange={() => updateField('layout', layout.value)} class="mt-0.5 accent-blue-500" />
									<div>
										<div class="text-sm font-medium text-gray-700">{layout.label}</div>
										<div class="text-xs text-gray-400">{layout.desc}</div>
									</div>
								</label>
							{/each}
						</div>
					</div>

					<div>
						<p class="lbl mb-3">Card Size</p>
						<div class="space-y-1">
							{#each sizes as size}
								<label class="flex items-center gap-2 cursor-pointer py-1.5 text-sm text-gray-600">
									<input type="radio" name="size" value={size.value} checked={data.size === size.value} onchange={() => updateField('size', size.value)} class="accent-blue-500" />
									{size.label}
								</label>
							{/each}
						</div>
					</div>

					<div>
						<p class="lbl mb-3">Colors</p>
						<div class="space-y-3">
							{#each ([
								['Accent / Primary', 'primaryColor'],
								['Text', 'textColor'],
								['Background', 'bgColor']
							] as [string, 'primaryColor'|'textColor'|'bgColor'][]) as [label, key]}
								<div class="flex items-center gap-3">
									<label for={`color-${key}-picker`} class="text-sm text-gray-600 flex-1">{label}</label>
									<input
										id={`color-${key}-picker`}
										aria-label={`${label} color picker`}
										type="color"
										value={'#' + data[key]}
										oninput={(e) => updateField(key, e.currentTarget.value.replace('#', ''))}
										class="w-8 h-8 rounded-md cursor-pointer border border-gray-300 p-0.5 bg-white"
									/>
									<input
										id={`color-${key}-hex`}
										aria-label={`${label} hex value`}
										value={data[key]}
										oninput={(e) => { const v = e.currentTarget.value.replace('#',''); if (/^[0-9a-fA-F]{6}$/.test(v)) updateField(key, v); }}
										maxlength={7}
										class="inp !w-24 font-mono text-xs"
										placeholder="rrggbb"
									/>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- RIGHT PANEL -->
		<div class="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-lg bg-gray-500 p-4 shadow lg:h-full">
			<!-- Tab bar + actions -->
			<div class="flex items-center gap-3 mb-4">
				<h2 class="flex-1 text-lg font-semibold text-white">
					{rightTab === 'preview' ? 'Business Card Preview' : 'Typst Code'}
				</h2>
				<div class="flex gap-2">
					{#if rightTab === 'typst'}
						<button onclick={copyTypst} class="secondary text-xs">
							{typstCopied ? 'Copied' : 'Copy'}
						</button>
					{/if}
				</div>
			</div>

			<!-- Panel content -->
			<div class="flex-1 min-h-0 overflow-auto rounded-lg bg-gray-100">
				{#if rightTab === 'preview'}
					<div class="h-full flex flex-col items-center justify-center p-8">
						{#if !compilerReady && !compileError}
							<div class="text-center space-y-3">
								<div class="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
								<p class="text-sm text-gray-400">Loading Typst compiler…</p>
							</div>
						{:else if compileError}
							<div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm w-full" aria-live="polite">
								<p class="text-red-600 text-sm font-medium mb-1">Compile error</p>
								<pre class="text-red-500 text-xs whitespace-pre-wrap break-all">{compileError}</pre>
								{#if !compilerReady}
									<button
										onclick={initializeCompiler}
										class="danger mt-3 text-sm"
									>
										Retry compiler
									</button>
								{/if}
							</div>
						{:else if isCompiling && !svgPreview}
							<div class="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
						{:else if svgPreview}
							<div class="flex flex-col items-center gap-4 w-full">
								<p class="text-xs text-gray-400">This is a live preview of your business card.</p>
								<div
									class="shadow-lg rounded overflow-hidden transition-opacity duration-200 {isCompiling ? 'opacity-60' : ''}"
									style="max-width: min(560px, 100%);"
								>
									{@html svgPreview}
								</div>
							</div>
						{:else}
							<p class="text-sm text-gray-400">This is a live preview of your business card.</p>
						{/if}
					</div>

				{:else}
					<pre class="p-5 text-xs text-gray-100 bg-gray-900 leading-relaxed font-mono whitespace-pre-wrap break-all overflow-auto h-full">{generateTypstCode(data)}</pre>
				{/if}
			</div>
		</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="bg-white border-t border-gray-200 mt-auto">
		<div
			class="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[11px] leading-tight text-gray-500"
		>
			<p>
				{new Date().getFullYear()} CardSmith -
				<a href="https://asternberg.xyz" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700"
					>Austin Sternberg</a
				>
				&middot;
				<a href="https://typst.app" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700">Typst</a>
				&middot; A ToolSmith product
			</p>
			<p>
				Missing something?
				<a
					href="https://github.com/YoyoJesus/CardSmith"
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium text-blue-600 underline hover:text-blue-800">Contribute on GitHub</a
				>
			</p>
		</div>
	</footer>
</div>
