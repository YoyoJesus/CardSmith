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

	const profiles = [
		{ key: 'linkedin', label: 'LinkedIn username' },
		{ key: 'github', label: 'GitHub username' },
		{ key: 'twitter', label: 'Twitter / X username' },
	] as const;
</script>

<div class="editor-form">
	<div class="editor-heading">
		<h2>Social Profiles</h2>
	</div>
	<section class="editor-card" aria-labelledby={`${uid}-profiles`}>
		<h3 id={`${uid}-profiles`} class="editor-subheading">Usernames</h3>
		<p class="editor-description">Enter the username only. CardSmith builds the profile link for you.</p>
		<div class="editor-grid">
			{#each profiles as profile, i (profile.key)}
				<div class:editor-span={i === profiles.length - 1}>
					<label for={`${uid}-${profile.key}`} class="lbl"
						>{profile.label} <span class="optional">(optional)</span></label
					>
					<input
						id={`${uid}-${profile.key}`}
						value={data[profile.key]}
						oninput={(e) => update(profile.key, e.currentTarget.value)}
						placeholder="janedoe"
					/>
				</div>
			{/each}
		</div>
	</section>
</div>
