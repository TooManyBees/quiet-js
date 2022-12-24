
import App from './App.svelte';

document.body.replaceChildren();

const app = new App({
	target: document.body,
	props: {}
});

export default app;
