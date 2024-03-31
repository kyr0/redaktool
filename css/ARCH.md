# Tailwind.css Chrome Extension integration via Web Component

This Tainwind.css setup is somewhat special, as we're facing multiple challenges:
- Tailwind shall work nominal
- Radix shall work nominal
- shadcn UI components shall work nominal
- dark/light mode switch shall work via chrome-storage backed preferences
- dark/light mode styling shall be inherited by Tailwind.css base styles and CSS props
- dark/light mode customization shall work via re-usable custom CSS component classes

However,
- this extension injects a content script in the website, so the styles must be isolated,
- which is why this implementation is using a web component with shadow root,
- however Tailwind.css was never designed to run inside of a shadow root, it would try to
set a `window.documentElement` class or use a global selector to switch between dark/light mode
and it would expect the styles to be globally valid, including normalization styles etc. pp.
- therefore two "themes" are generated, `dist/style-dark.css` and `dist/style-light.css``
and their injection in the isolated shadow root is handled via a `bun` build-step which inlines
both CSS in the javascript code as raw text and the runtime code injects/toggles a `<style>` tag dynamically