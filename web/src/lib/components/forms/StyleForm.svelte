<script lang="ts">
	import type { BusinessCardData, CardLayout, CardSize } from '$lib/types';

	let {
		data,
		update,
	}: {
		data: BusinessCardData;
		update: <K extends keyof BusinessCardData>(key: K, value: BusinessCardData[K]) => void;
	} = $props();
	const uid = $props.id();

	const layouts: { value: CardLayout; label: string; desc: string }[] = [
		{ value: 'bar', label: 'Accent Bar', desc: 'Vertical color bar on the left' },
		{ value: 'classic', label: 'Classic', desc: 'Left-aligned with rule divider' },
		{ value: 'centered', label: 'Centered', desc: 'Everything centered' },
		{ value: 'header', label: 'Header Block', desc: 'Colored block at top' },
	];

	const sizes: { value: CardSize; label: string }[] = [
		{ value: 'us', label: 'US Standard (3.5" × 2")' },
		{ value: 'eu', label: 'EU Standard (85mm × 55mm)' },
		{ value: 'square', label: 'Square (2.5" × 2.5")' },
	];

	const colors = [
		{ key: 'primaryColor', label: 'Accent / Primary' },
		{ key: 'textColor', label: 'Text' },
		{ key: 'bgColor', label: 'Background' },
	] as const;
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Card Style</h2>
	</div>
	<fieldset class="editor-card">
		<legend class="sr-only">Layout</legend>
		<p class="editor-subheading" aria-hidden="true">Layout</p>
		<div class="editor-grid">
			{#each layouts as layout (layout.value)}
				<label
					class="flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-blue-500 {data.layout ===
					layout.value
						? 'border-blue-300 bg-blue-50'
						: 'border-gray-200 hover:bg-gray-100'}"
				>
					<input
						type="radio"
						name={`${uid}-layout`}
						value={layout.value}
						checked={data.layout === layout.value}
						onchange={() => update('layout', layout.value)}
						class="mt-0.5 accent-blue-600"
					/>
					<span>
						<span class="block text-sm font-medium text-gray-800">{layout.label}</span>
						<span class="block text-xs text-gray-500">{layout.desc}</span>
					</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<fieldset class="editor-card">
		<legend class="sr-only">Card size</legend>
		<p class="editor-subheading" aria-hidden="true">Card size</p>
		<div class="flex flex-col gap-1">
			{#each sizes as size (size.value)}
				<label class="flex cursor-pointer items-center gap-2 py-1 text-sm text-gray-700">
					<input
						type="radio"
						name={`${uid}-size`}
						value={size.value}
						checked={data.size === size.value}
						onchange={() => update('size', size.value)}
						class="accent-blue-600"
					/>
					{size.label}
				</label>
			{/each}
		</div>
	</fieldset>

	<section class="editor-card" aria-labelledby={`${uid}-colors`}>
		<h3 id={`${uid}-colors`} class="editor-subheading">Colors</h3>
		<div class="flex flex-col gap-3">
			{#each colors as color (color.key)}
				<div class="flex items-center gap-3">
					<label for={`${uid}-${color.key}-picker`} class="flex-1 text-sm text-gray-700">{color.label}</label>
					<input
						id={`${uid}-${color.key}-picker`}
						aria-label={`${color.label} color picker`}
						type="color"
						value={'#' + data[color.key]}
						oninput={(e) => update(color.key, e.currentTarget.value.replace('#', ''))}
						class="h-8 w-8 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
					/>
					<input
						aria-label={`${color.label} hex value`}
						value={data[color.key]}
						oninput={(e) => {
							const v = e.currentTarget.value.replace('#', '');
							if (/^[0-9a-fA-F]{6}$/.test(v)) update(color.key, v);
						}}
						maxlength={7}
						class="w-24! font-mono text-xs"
						placeholder="rrggbb"
					/>
				</div>
			{/each}
		</div>
	</section>
</div>
