<script lang="ts">
  import * as config from '$lib/config'
  import '../app.css'

  let y;
</script>

<svelte:head>
<title>patrick stoica / software engineer • audiovisual artist</title>
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('phc_GlHVllLBZzjEPfxsTf1U2WzjRSrJBXVkOjqSH37bnf1',{api_host:'https://ph.patrickstoica.com'})
</script>
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="layout">
  <nav class="text-center pt-20 pb-16">
    <ul class="list-none flex flex-row gap-2 mx-auto justify-center text-sm sm:text-base absolute sm:top-4 sm:right-4 top-2 right-2">
      <li>
        <a href="mailto:patark@icloud.com">email</a>
      </li>
      <li>
        <a href="https://instagram.com/patark">instagram</a>
      </li>
      <li>
        <a href="https://github.com/pstoica">github</a>
      </li>
      <li>
        <a href="https://linkedin.com/in/pstoica">linkedin</a>
      </li>
      <li>
        <a href="/PatrickStoicaResume.pdf">cv</a>
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
