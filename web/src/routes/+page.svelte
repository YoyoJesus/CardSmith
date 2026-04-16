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
			svgPreview = await compileToSvg(generateTypstCode(data));
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

<div class="min-h-screen flex flex-col bg-[#edf0f5] font-sans">

	<!-- Header -->
	<header class="px-8 pt-7 pb-5 flex items-center justify-between">
		<h1 class="text-lg font-semibold text-gray-800">Business Card Generator</h1>
		<button
			onclick={() => { cardStore.reset(); scheduleCompile(); }}
			class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
		>
			Reset
		</button>
	</header>

	<!-- Main two-column layout -->
	<div class="flex-1 px-8 pb-4 grid grid-cols-2 gap-5">

		<!-- LEFT PANEL -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
			<!-- Tabs -->
			<div class="flex border-b border-gray-200 px-1">
				{#each (['info', 'contact', 'social', 'style'] as const) as tab}
					<button
						onclick={() => (leftTab = tab)}
						class="px-4 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px {leftTab === tab
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700'}"
					>
						{tab}
					</button>
				{/each}
			</div>

			<!-- Form content -->
			<div class="flex-1 overflow-y-auto p-6 space-y-5">
				{#if leftTab === 'info'}
					<div>
						<label class="lbl">Full Name</label>
						<input value={data.name} oninput={(e) => updateField('name', e.currentTarget.value)} placeholder="Jane Doe" class="inp" />
					</div>
					<div>
						<label class="lbl">Job Title</label>
						<input value={data.title} oninput={(e) => updateField('title', e.currentTarget.value)} placeholder="Software Engineer" class="inp" />
					</div>
					<div>
						<label class="lbl">Company <span class="optional">(optional)</span></label>
						<input value={data.company} oninput={(e) => updateField('company', e.currentTarget.value)} placeholder="Acme Corp" class="inp" />
					</div>

				{:else if leftTab === 'contact'}
					<div>
						<label class="lbl">Email</label>
						<input value={data.email} oninput={(e) => updateField('email', e.currentTarget.value)} type="email" placeholder="jane@example.com" class="inp" />
					</div>
					<div>
						<label class="lbl">Phone <span class="optional">(optional)</span></label>
						<input value={data.phone} oninput={(e) => updateField('phone', e.currentTarget.value)} placeholder="+1 555 123 4567" class="inp" />
					</div>
					<div>
						<label class="lbl">Website <span class="optional">(optional)</span></label>
						<input value={data.website} oninput={(e) => updateField('website', e.currentTarget.value)} placeholder="janedoe.com" class="inp" />
					</div>
					<div>
						<label class="lbl">Location <span class="optional">(optional)</span></label>
						<input value={data.location} oninput={(e) => updateField('location', e.currentTarget.value)} placeholder="San Francisco, CA" class="inp" />
					</div>

				{:else if leftTab === 'social'}
					<div>
						<label class="lbl">LinkedIn username <span class="optional">(optional)</span></label>
						<input value={data.linkedin} oninput={(e) => updateField('linkedin', e.currentTarget.value)} placeholder="janedoe" class="inp" />
					</div>
					<div>
						<label class="lbl">GitHub username <span class="optional">(optional)</span></label>
						<input value={data.github} oninput={(e) => updateField('github', e.currentTarget.value)} placeholder="janedoe" class="inp" />
					</div>
					<div>
						<label class="lbl">Twitter / X username <span class="optional">(optional)</span></label>
						<input value={data.twitter} oninput={(e) => updateField('twitter', e.currentTarget.value)} placeholder="janedoe" class="inp" />
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
									<span class="text-sm text-gray-600 flex-1">{label}</span>
									<input
										type="color"
										value={'#' + data[key]}
										oninput={(e) => updateField(key, e.currentTarget.value.replace('#', ''))}
										class="w-8 h-8 rounded-md cursor-pointer border border-gray-300 p-0.5 bg-white"
									/>
									<input
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
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
			<!-- Tab bar + actions -->
			<div class="flex items-center border-b border-gray-200 px-1">
				<div class="flex flex-1">
					{#each (['preview', 'typst'] as const) as tab}
						<button
							onclick={() => (rightTab = tab)}
							class="px-4 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px {rightTab === tab
								? 'border-blue-500 text-blue-600'
								: 'border-transparent text-gray-500 hover:text-gray-700'}"
						>
							{tab === 'typst' ? 'Typst' : 'Preview'}
						</button>
					{/each}
				</div>
				<div class="flex gap-2 pr-3">
					<button
						onclick={handleDownload}
						disabled={isDownloading || !compilerReady}
						class="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
					>
						{#if isDownloading}
							<span class="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
						{/if}
						Download PDF
					</button>
					{#if rightTab === 'typst'}
						<button
							onclick={copyTypst}
							class="border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
						>
							{typstCopied ? 'Copied!' : 'Copy Typst'}
						</button>
					{/if}
				</div>
			</div>

			<!-- Panel content -->
			<div class="flex-1 overflow-auto">
				{#if rightTab === 'preview'}
					<div class="h-full flex flex-col items-center justify-center p-8">
						{#if !compilerReady && !compileError}
							<div class="text-center space-y-3">
								<div class="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
								<p class="text-sm text-gray-400">Loading Typst compiler…</p>
							</div>
						{:else if compileError}
							<div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm w-full">
								<p class="text-red-600 text-sm font-medium mb-1">Compile error</p>
								<pre class="text-red-500 text-xs whitespace-pre-wrap break-all">{compileError}</pre>
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
					<pre class="p-5 text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap break-all overflow-auto h-full">{generateTypstCode(data)}</pre>
				{/if}
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="text-center py-5 text-sm text-gray-400">
		Made by <a href="https://github.com/YoyoJesus" class="text-blue-500 hover:underline" target="_blank">Austin Sternberg</a>
	</footer>
</div>

<style>
	:global(.lbl) {
		display: block;
		font-size: 0.8125rem;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.375rem;
	}
	:global(.optional) {
		font-weight: 400;
		color: #9ca3af;
	}
	:global(.inp) {
		width: 100%;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.4rem 0.625rem;
		font-size: 0.875rem;
		color: #111827;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	:global(.inp:focus) {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	:global(.inp::placeholder) {
		color: #9ca3af;
	}
</style>
