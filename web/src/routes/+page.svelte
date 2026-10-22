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
	import TabBar from '$lib/components/TabBar.svelte';
	import PreviewPanel from '$lib/components/PreviewPanel.svelte';
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
	let activeTab = $state('info');
	let showCode = $state(false);
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

	const contentTabs = [
		{ id: 'info', label: 'Info' },
		{ id: 'contact', label: 'Contact' },
		{ id: 'social', label: 'Social' },
	];
	const appearanceTabs = [{ id: 'style', label: 'Style' }];
</script>

<svelte:head>
	<title>CardSmith | Business Card Maker</title>
</svelte:head>

<!--
	Locked to the viewport from lg up so the page itself never scrolls: the two panels scroll inside main. Below lg
	the panels stack and the page scrolls normally.
-->
<div class="flex min-h-screen flex-col bg-gray-100 lg:h-screen lg:overflow-hidden">
	<AppHeader
		bind:showCode
		{isDownloading}
		{compilerReady}
		onDownload={handleDownload}
		onDownloadTypst={saveTypst}
		onReset={() => {
			cardStore.reset();
			scheduleCompile();
		}}
	/>

	<main class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:min-h-0 lg:flex-1 lg:px-8">
		<div class="grid grid-cols-1 gap-6 lg:h-full lg:min-h-0 lg:grid-cols-2">
			<!-- Form Panel -->
			<div class="max-h-[calc(100vh-10rem)] overflow-auto rounded-lg bg-white p-6 shadow lg:h-full lg:max-h-none">
				<TabBar content={contentTabs} appearance={appearanceTabs} bind:activeTab />

				{#if activeTab === 'info'}
					<InfoForm {data} update={updateField} />
				{:else if activeTab === 'contact'}
					<ContactForm {data} update={updateField} />
				{:else if activeTab === 'social'}
					<SocialForm {data} update={updateField} />
				{:else if activeTab === 'style'}
					<StyleForm {data} update={updateField} />
				{/if}
			</div>

			<!-- Preview Panel -->
			<PreviewPanel
				{showCode}
				typstCode={generateTypstCode(data)}
				{svgPreview}
				{isCompiling}
				{compilerReady}
				{compileError}
				onRetry={initializeCompiler}
			/>
		</div>
	</main>

	<AppFooter />
</div>
