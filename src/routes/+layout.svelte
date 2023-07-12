<script lang="ts">
	import * as config from '$lib/config'
	// import Header from './header.svelte'

	// import 'open-props/style'
	// import 'open-props/normalize'
	// import 'open-props/buttons'

	import '../app.css'
</script>

<div class="layout">
  <!-- Header -->
	<!-- <Header /> -->

	<nav class="text-center py-16">
		<ul class="list-none flex flex-row gap-1 mx-auto justify-center text-sm sm:text-base absolute sm:top-4 sm:right-4 top-2 right-2">
			<li>
				<a href="mailto:patark@icloud.com">email</a>
			</li>
			<li></li>
			<li>
				<a href="https://github.com/pstoica">github</a>
				<!-- <a href="/PatrickStoica.pdf">cv</a> -->
			</li>
		</ul>
		<a href="/" class="title text-5xl">{config.title}</a>
	
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
		/* padding: var(--size-7);
		gap: var(--size-8); */
	}

	.title {
		background-image: radial-gradient(circle at 50% 200%, #000142, #3b0083, #b300c3, #ff059f, #ff4661, #ffad86, #fff3c7);
		background-size: cover;
		background-clip: text;
		color: transparent;
	}

	:global(html) {
    background-color: theme(colors.zinc.900);
		color: theme(colors.zinc.300);
		font-family: 'Rubik', sans-serif;
  }
</style>
