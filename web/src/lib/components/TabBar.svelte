<script lang="ts">
	import { nextMenuIndex } from '$lib/menu-navigation';

	export type EditorTab = { id: string; label: string };

	let {
		content,
		appearance,
		panelId,
		activeTab = $bindable(),
	}: { content: EditorTab[]; appearance: EditorTab[]; panelId: string; activeTab: string } = $props();

	let tablist = $state<HTMLDivElement>();
	let allTabs = $derived([...content, ...appearance]);

	function tabId(id: string) {
		return `editor-tab-${id}`;
	}

	// One tablist spans both groups, so the arrow keys move straight from Social to Style.
	function onKeydown(event: KeyboardEvent) {
		const keys: Record<string, string> = { ArrowRight: 'ArrowDown', ArrowLeft: 'ArrowUp', Home: 'Home', End: 'End' };
		if (!(event.key in keys)) return;
		const next = nextMenuIndex(
			keys[event.key],
			allTabs.findIndex((tab) => tab.id === activeTab),
			allTabs.length,
		);
		if (next === null) return;
		event.preventDefault();
		activeTab = allTabs[next].id;
		tablist?.querySelector<HTMLElement>(`#${tabId(activeTab)}`)?.focus();
	}
</script>

{#snippet tabButton(tab: EditorTab)}
	<button
		type="button"
		role="tab"
		id={tabId(tab.id)}
		aria-selected={activeTab === tab.id}
		aria-controls={panelId}
		tabindex={activeTab === tab.id ? 0 : -1}
		class="tab text-sm {activeTab === tab.id
			? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
			: 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}"
		onclick={() => (activeTab = tab.id)}>{tab.label}</button
	>
{/snippet}

<div
	bind:this={tablist}
	class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-4"
	role="tablist"
	aria-label="Editor sections"
	tabindex="-1"
	onkeydown={onKeydown}
>
	<div class="track">
		{#each content as tab (tab.id)}
			{@render tabButton(tab)}
		{/each}
	</div>
	{#if appearance.length > 0}
		<div class="flex items-center gap-2">
			<span class="appearance-label" aria-hidden="true">Appearance</span>
			<div class="track">
				{#each appearance as tab (tab.id)}
					{@render tabButton(tab)}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	/* The global button rule in app.css is unlayered, so sizes are set here rather than with utilities. */
	.appearance-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--color-gray-500);
	}

	.track {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem;
		border-radius: 0.5rem;
		background-color: var(--color-gray-100);
		padding: 0.125rem;
	}

	.tab {
		padding: 0.3125rem 0.625rem;
		white-space: nowrap;
	}

	.tab:focus-visible {
		outline: 2px solid var(--color-blue-500);
		outline-offset: 1px;
	}

	@media (prefers-reduced-motion: no-preference) {
		.tab {
			transition:
				background-color 140ms ease-out,
				color 140ms ease-out,
				box-shadow 140ms ease-out,
				transform 100ms ease-out;
		}

		.tab:active {
			transform: translateY(1px);
		}
	}
</style>
