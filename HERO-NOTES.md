# Hero scroll-video fix

The existing site remains plain HTML, CSS and JavaScript. Only the Hero's video source/loading, scroll controller and short-screen styles have changed.

## Preview

Run `node preview.cjs`, then open http://127.0.0.1:4175/. The local server supports HTTP byte ranges for video seeking. Production hosting should also support byte ranges and serve MP4 files as `video/mp4`.

## Diagnosis and fix

- The original 10-second, 1280×720, 24 fps H.264 video has 240 frames but only one keyframe. Continuous currentTime assignments repeatedly interrupted long decodes, particularly in reverse.
- `assets/burj-khalifa-scrub.mp4` is a separate high-quality H.264 encode with every frame independently decodable, no audio, and metadata at the beginning. The original `burj-khalifa-scroll.mp4` is unchanged. Encoding used libx264, CRF 16, GOP 1, no B frames, yuv420p and faststart; no resizing or frame interpolation.
- The optimized file is about 14.1 MB versus 2.5 MB for the source. This trades download size for fast random seeking. It preloads normally and has an 82 KB poster extracted from the original first frame. Slow network loading can still affect initial readiness.
- The controller maps the actual sticky travel distance to video frames, allows one seek at a time and discards stale scroll targets. It coalesces scroll events with requestAnimationFrame, caches geometry until resize and has no perpetual animation loop or added inertia.
- Playback stays paused. The last target is the last visible frame, not the end-of-file timestamp. Metadata/data readiness, tab visibility, restored pages and resizing refresh the target.
- Stable viewport units prevent mobile browser chrome from changing the scroll distance. A Hero-only short-landscape rule keeps the existing copy and buttons visible.

## Browser verification

Tested in isolated headless Microsoft Edge with actual video decoding, screenshots, scroll sweeps and mouse-wheel input. Screenshots were visually inspected.

- Baseline six-second forward/reverse sweep: 27 presented frames, maximum presentation gap 5,419 ms.
- First fixed sweep: 360 presented frames, maximum gap 18.1 ms on this machine. These are local measurements, not a guarantee for every device or connection.
- Wheel forward/reverse, idle at a nonzero position, first/last frame, sticky release, delayed media loading and resize passed.
- Desktop 1440×900, portrait 390×844 and landscape 844×390 tested. Mobile sizes are browser viewport tests, not physical iOS/Android device tests.
- No page JavaScript errors in those checks. HTML outside the Hero, other section JavaScript and all original CSS rules were checked against the prior copy and preserved.

Test scripts and results are in `work/hero-check.cjs`, `work/hero-interaction.cjs` and the accompanying JSON/PNG files. Set `PLAYWRIGHT_PATH` to a Playwright installation to run the scripts elsewhere. FFmpeg tooling in `.tools/` and test files in `work/` are local development files and are not needed to deploy the site.
