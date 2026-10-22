<script lang="ts">
	import type { BusinessCardData } from '$lib/types';

	let {
		data,
		update,
	}: {
		data: BusinessCardData;
		update: <K extends keyof BusinessCardData>(key: K, value: BusinessCardData[K]) => void;
	} = $props();
	const uid = $props.id();
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Card Information</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-identity`}>
		<h3 id={`${uid}-identity`} class="editor-subheading">Identity</h3>
		<div class="editor-grid">
			<div class="editor-span">
				<label for={`${uid}-full-name`} class="lbl">Full Name</label>
				<input
					id={`${uid}-full-name`}
					value={data.name}
					oninput={(e) => update('name', e.currentTarget.value)}
					placeholder="Jane Doe"
				/>
			</div>
			<div>
				<label for={`${uid}-job-title`} class="lbl">Job Title</label>
				<input
					id={`${uid}-job-title`}
					value={data.title}
					oninput={(e) => update('title', e.currentTarget.value)}
					placeholder="Software Engineer"
				/>
			</div>
			<div>
				<label for={`${uid}-company`} class="lbl">Company <span class="optional">(optional)</span></label>
				<input
					id={`${uid}-company`}
					value={data.company}
					oninput={(e) => update('company', e.currentTarget.value)}
					placeholder="Acme Corp"
				/>
			</div>
		</div>
	</section>
</div>
