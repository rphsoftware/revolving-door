# Revolving door

A modern web player for Binary Revolution Stream (BRSTM) files

## Compiling

This program is built using webpack. To set up a dev environment, simply run `yarn` and to compile run `npm run build`. The compiled js is then dropped into `dist/`

## Operation

This program exposes a very basic API to the window context with just one function to initiate playback. `window.player.play(URL)`. Afterwards, everything is handled by gui.

To properly add this program to your website, you also need to link the `player.css` stylesheet somewhere.

## Browser compatibility

The program has been tested in all modern browsers (Chrome, Firefox, Safari) and has been known to also work on some older ones like Palemoon 28 and Icecat 60.

The program attempts to adjust its functionality to what the browser requires (Either disabling or enabling the streaming features for example).

