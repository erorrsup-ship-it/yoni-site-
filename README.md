# Yoni Katz portfolio

Static site: plain HTML, CSS and JavaScript, no build step. Vercel deploys it on every push to `main`.

## Add a video

1. Put three files in `media/`, all with the same id (for example `g06`):
   - `g06.mp4`: the full video
   - `g06-loop.mp4`: a 4-second muted preview
   - `g06.jpg`: a poster frame
2. Open `js/content.js` and add an entry to that project's `items` list.
3. Add the id to `strip` at the top of the same file if it should appear on the home page.
4. Commit and push. The site updates by itself.

## Add a project or a website card

Copy one of the blocks in `projects` or `web` inside `js/content.js` and edit it.
The looks ("themes") that each video or website brings are defined near the top of `css/site.css`.

## Files

- `index.html`: the page
- `css/site.css`: all styling
- `js/content.js`: all text, projects and videos
- `js/site.js`: behaviour (strip, player, language switch)
- `media/`: videos, preview loops, posters, screenshots

## Credits

The motion effects in `js/fx.js` are plain-JavaScript ports of components from [React Bits](https://reactbits.dev) (MIT + Commons Clause): Split Text, Blur Text, Rotating Text, Scroll Reveal, Count Up, Magnet, Flowing Menu, Tilted Card and Click Spark.
