<script lang="ts">
	import * as config from '$lib/config'
	import '../app.css'

	let y;
</script>

<svelte:head>
<title>patrick stoica / software engineer • audiovisual artist</title>
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="layout">
	<nav class="text-center pt-20 pb-16">
		<ul class="list-none flex flex-row gap-2 mx-auto justify-center text-sm sm:text-base absolute sm:top-4 sm:right-4 top-2 right-2">
			<li>
				<a href="mailto:patark@icloud.com">email</a>
			</li>
			<li>
				<a href="/PatrickStoicaResume.pdf">cv</a>
			</li>
			<li>
				<a href="https://github.com/pstoica">github</a>
			</li>
			<li>
				<a href="https://instagram.com/patark">instagram</a>
			</li>
		</ul>
		<a href="/" class="title text-6xl" 
		style="background-position: -55px calc(50% - {y * 0.6}px);"	
		>{config.title}</a>
	
		<div class="subtitle">{config.description}</div>
	
	
	</nav>

	<main class="prose prose-invert lg:prose-l max-w-none px-4">
		<slot />
	</main>
</div>

<style lang="postcss">
	.layout {
		height: 100%;
		display: flex;
		flex-direction: column;
		max-width: 740px;
		margin: 0 auto;
		padding-bottom: theme(space.4);
	}

	.title {
		/* background-image: radial-gradient( circle at top right, hsl(180 100% 50%), hsl(180 100% 50% / 0%) ), radial-gradient( circle at bottom left, hsl(328 100% 54%), hsl(328 100% 54% / 0%) ); */
		background: theme(colors.purple.200) url(/marbling.jpeg);
		background-position: -55px 50%;
		
		background-clip: text;
		color: transparent;
	}

	:global(html) {
    background-color: theme(colors.zinc.900);
		color: theme(colors.zinc.300);
  }
</style>
