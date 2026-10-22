<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { cardStore } from '$lib/store';
	import { generateTypstCode } from '$lib/typst-generator';
	import { compileToSvg, compileToPdf, downloadPdf, initCompiler } from '$lib/pdf-compiler';
	import type { BusinessCardData } from '$lib/types';
	import { footerStore } from '$lib/footer-store';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import AppFooter from '$lib/components/AppFooter.svelte';
	import InfoForm from '$lib/components/forms/InfoForm.svelte';
	import ContactForm from '$lib/components/forms/ContactForm.svelte';
	import SocialForm from '$lib/components/forms/SocialForm.svelte';
	import StyleForm from '$lib/components/forms/StyleForm.svelte';

	let data = $state({ ...$cardStore });
	let svgPreview = $state('');
	let compileError = $state('');
	let isCompiling = $state(false);
	let isDownloading = $state(false);
	let compilerReady = $state(false);
	let leftTab = $state<'info' | 'contact' | 'social' | 'style'>('info');
	let showCode = $state(false);
	let typstCopied = $state(false);
	let compileRequest = 0;

	let debounceTimer: ReturnType<typeof setTimeout>;

	const unsubscribe = cardStore.subscribe((val) => {
		data = { ...val };
	});

	onMount(() => {
		footerStore.loadFromStorage();
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

	function updateField<K extends keyof BusinessCardData>(key: K, value: BusinessCardData[K]) {
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
</script>

<svelte:head>
	<title>CardSmith | Business Card Maker</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 flex flex-col lg:h-screen lg:overflow-hidden">

	<AppHeader
		bind:showCode
		{isDownloading}
		{compilerReady}
		onDownload={handleDownload}
		onDownloadTypst={saveTypst}
		onCopyTypst={copyTypst}
		onReset={() => {
			cardStore.reset();
			scheduleCompile();
		}}
	/>

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
			<div class="flex-1 overflow-y-auto pr-1">
				{#if leftTab === 'info'}
					<InfoForm {data} update={updateField} />
				{:else if leftTab === 'contact'}
					<ContactForm {data} update={updateField} />
				{:else if leftTab === 'social'}
					<SocialForm {data} update={updateField} />
				{:else if leftTab === 'style'}
					<StyleForm {data} update={updateField} />
				{/if}
			</div>
		</div>

		<!-- RIGHT PANEL -->
		<div class="flex h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-lg bg-gray-500 p-4 shadow lg:h-full">
			<!-- Tab bar + actions -->
			<div class="flex items-center gap-3 mb-4">
				<h2 class="flex-1 text-lg font-semibold text-white">
					{!showCode ? 'Business Card Preview' : 'Typst Code'}
				</h2>
				<div class="flex gap-2">
					{#if showCode}
						<button onclick={copyTypst} class="secondary text-xs">
							{typstCopied ? 'Copied' : 'Copy'}
						</button>
					{/if}
				</div>
			</div>

			<!-- Panel content -->
			<div class="flex-1 min-h-0 overflow-auto rounded-lg bg-gray-100">
				{#if !showCode}
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

	<AppFooter />
</div>
