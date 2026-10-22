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
		<h2>Contact Details</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-reach`}>
		<h3 id={`${uid}-reach`} class="editor-subheading">Reach me</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-email`} class="lbl">Email</label>
				<input
					id={`${uid}-email`}
					type="email"
					value={data.email}
					oninput={(e) => update('email', e.currentTarget.value)}
					placeholder="jane@example.com"
				/>
			</div>
			<div>
				<label for={`${uid}-phone`} class="lbl">Phone <span class="optional">(optional)</span></label>
				<input
					id={`${uid}-phone`}
					type="tel"
					value={data.phone}
					oninput={(e) => update('phone', e.currentTarget.value)}
					placeholder="+1 555 123 4567"
				/>
			</div>
		</div>
	</section>
	<section class="editor-card" aria-labelledby={`${uid}-where`}>
		<h3 id={`${uid}-where`} class="editor-subheading">Web and location</h3>
		<div class="editor-grid">
			<div>
				<label for={`${uid}-website`} class="lbl">Website <span class="optional">(optional)</span></label>
				<input
					id={`${uid}-website`}
					value={data.website}
					oninput={(e) => update('website', e.currentTarget.value)}
					placeholder="janedoe.com"
				/>
			</div>
			<div>
				<label for={`${uid}-location`} class="lbl">Location <span class="optional">(optional)</span></label>
				<input
					id={`${uid}-location`}
					value={data.location}
					oninput={(e) => update('location', e.currentTarget.value)}
					placeholder="San Francisco, CA"
				/>
			</div>
		</div>
	</section>
</div>
