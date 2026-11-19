# حروف وكلمات

An Arabic crossword game with three themed levels, phrase and picture clues, and progress saved in your browser.

[Play on GitHub Pages](https://mrmaftahsa.github.io/huruf-wa-kalimat/)

Choose a level, select a word, and fill the answer from right to left. Solved words fill their shared letters on the board. Each level starts with 10 hint credits. Revealing a letter costs two credits and removing a distractor costs one. Zero hints earns three stars, one hint earns two, and two or more hints earns one.

## Development

Use Node.js 24.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

The browser tests build the app and start Vite's production preview. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to a compatible system Chromium path if one is already installed. Run `npm run build` to regenerate the static site in `dist/` and `npm run preview` to serve that build locally.

## Puzzles

`src/levels.ts` defines each level's entries. Across entries start at the right and decrease `x`. Down entries increase `y`. Coordinates start at zero. Each intersection must have matching letters and perpendicular directions. Enter display answers as continuous Arabic letters without vowel marks. Answer comparison ignores vowel marks, whitespace and tatweel, and preserves letter distinctions such as ا and أ.

Progress is stored separately for each level in browser local storage.

## Deployment

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The deployment workflow runs on pushes to `main` and can also be run manually. The app uses hash routes and relative asset URLs for the repository subpath.

## Credits

Picture clues use unmodified Key (U+1F511), Sun With Face (U+1F31E), and Bicycle (U+1F6B2) graphics from [OpenMoji](https://openmoji.org/) by the OpenMoji contributors, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). See [the image license text](public/licenses/openmoji.txt).

The [Vazirmatn](https://github.com/rastikerdar/vazirmatn) font is distributed under the [SIL Open Font License 1.1](public/licenses/vazirmatn.txt).

## Android APK

[Download the Android APK](https://github.com/mrmaftahsa/huruf-wa-kalimat/releases/latest/download/huruf-wa-kalimat.apk) from GitHub Releases for Android 7.0 or newer. This is an installable debug build for sideloading. The game is bundled into the Android app and can be played offline. Browser and APK progress are stored separately.

The **Build Android APK** workflow builds a signed debug APK and verifies its signature and bundled assets. To build locally with JDK 21 and Android SDK 36, run `npm ci`, `npm run android:sync`, then `./gradlew assembleDebug` from the `android` directory.
