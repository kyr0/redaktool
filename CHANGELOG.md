# 0.0.0-increment-1.1.4 (2024-05-28)

### Features

* added perplexity AI support for online fact-checking ([cdac3cc](https://github.com/kyr0/ftr-ki-tools/commit/cdac3cc72899effd8406cfcca417bfff8c1b78b0))
* browser compatibility reset CSS ([2b205fd](https://github.com/kyr0/ftr-ki-tools/commit/2b205fd716c548b54412d625634e0e7e852ae653))
* debug code for scripts ([afb5ba9](https://github.com/kyr0/ftr-ki-tools/commit/afb5ba91971fb84a2bc03fff43cfcdd0b5a78057))
* i18n support with EN and DE, plus language switcher ([4a7d1ad](https://github.com/kyr0/ftr-ki-tools/commit/4a7d1ad67cd4eadecaf2a8c13f39e7821f21a786))
* scarping using ZenRows ([cb300b0](https://github.com/kyr0/ftr-ki-tools/commit/cb300b0d1d87d445efff4b602c9216ae8a48c6ec))
* scraping algorithm with auto-correlation for most relevant content ([ffe1d33](https://github.com/kyr0/ftr-ki-tools/commit/ffe1d335ad0a43244fdf775e22840ddb85e91cac))

### Experimental/Research

* Integrated and tested 5 different WYSIWYG editors ([
e6472b7
 ](https://github.com/kyr0/redaktool/commit/e6472b7fb70f379f461bc17c331370f63dfa1a80)):
- Tried Milkdown/CodeMirror (quality issues, complexity) [Markdown]
- Tried CKEditor (license issue) [HTML]
- Tried TinyMCE (license issue from 7+ on) [HTML]
- Tried Quill (BSD Clause, MIT compatible, commercially usable) [HTML], issues with selection in ShadowDOM
- Tried Slate, MIT licensed,
- Finally found Plate, based on Slate and compatible with Tailwind and Shadcn

# 0.0.0-increment-1.1.3 (2024-05-21)

### Documentation

* center alignment ([7724ec5](https://github.com/kyr0/ftr-ki-tools/commit/7724ec594ea7356fcb1d72f6fc37217770492c5d))
* huge logo ([e0e5491](https://github.com/kyr0/ftr-ki-tools/commit/e0e5491a7c9c004b6d915852a7efe2c7247fef87))

### Bug Fixes

* correcting assignment and recall of API key ([5f2e56f](https://github.com/kyr0/ftr-ki-tools/commit/5f2e56f49cff70d53933bfef0e289bde2c3d6979))
* initial display size is 1024 x 768 now ([11c20f5](https://github.com/kyr0/ftr-ki-tools/commit/11c20f5117c430f8adfdb4c974787cd33840e7a9))
* style adjustments, stabilizing font-size display over various websites ([329230a](https://github.com/kyr0/ftr-ki-tools/commit/329230a25e099d452e0101c84fa78756e68d805a))
* style fix for font sizing ([9aa6ffd](https://github.com/kyr0/ftr-ki-tools/commit/9aa6ffd095422ae6262c566112a5d6f7be1a4efe))
* tab highlighting fixed ([0959927](https://github.com/kyr0/ftr-ki-tools/commit/09599272b98781613a5cd02b2f4964cde7cb323e))

### Features

* better default text ([58f3010](https://github.com/kyr0/ftr-ki-tools/commit/58f30109e392dd12c7235cabcec6f9561318b1c5))
* CKEditor experimental integration ([d67bf39](https://github.com/kyr0/ftr-ki-tools/commit/d67bf396c6edbcf80994d5d5435980b563e5866f))
* implemented indexeddb database support with dexie abstraction, key-value storage ([23a2b78](https://github.com/kyr0/ftr-ki-tools/commit/23a2b786ea21c18926b63a1e53c48ee6d9b262aa))
* implemented streaming transcription and live transcoding ([a92f289](https://github.com/kyr0/ftr-ki-tools/commit/a92f289676cd1914119f93ec9f5ed7863512664a))
* using gpt-4o, enhanced storage interface for storage layer flag local or session ([063ed2e](https://github.com/kyr0/ftr-ki-tools/commit/063ed2ed20a3189098837d428706a8b8e559d3ea))

# 0.0.0-increment-1.1.2 (2024-05-14)

### Documentation

* added missing vectorstore link ([8202d47](https://github.com/kyr0/ftr-ki-tools/commit/8202d479152d429b5524209aa26552a586b448ac))
* changelog, split docs and fixes ([f59c4d1](https://github.com/kyr0/ftr-ki-tools/commit/f59c4d1b3ecaae5b1716e147573401a397972fdc))
* docs formatting ([5ee5fe2](https://github.com/kyr0/ftr-ki-tools/commit/5ee5fe2d0aa19adcacb04b64456631218db46bc3))
* docs formatting and links ([e84d686](https://github.com/kyr0/ftr-ki-tools/commit/e84d6869ab1ebbc7db94ea938dad0ba2b0ed2317))
* docs links ([54c3274](https://github.com/kyr0/ftr-ki-tools/commit/54c32746c99e6a59b5cecbb678d3dba9d0724b1b))
* docs links ([ff25f72](https://github.com/kyr0/ftr-ki-tools/commit/ff25f727c24bffbb7811e5234b53c643940200e6))
* huge logo ([e0e5491](https://github.com/kyr0/ftr-ki-tools/commit/e0e5491a7c9c004b6d915852a7efe2c7247fef87))

### Features

* better default text ([58f3010](https://github.com/kyr0/ftr-ki-tools/commit/58f30109e392dd12c7235cabcec6f9561318b1c5))
* preparation of LLM abstraction layer ([5dcb28b](https://github.com/kyr0/ftr-ki-tools/commit/5dcb28bd42450171336564323f84ea964b6029bb))
* translation, interactive prompt ([37646f3](https://github.com/kyr0/ftr-ki-tools/commit/37646f3349514e42521bdf00e3d26b1419a69e10))


# 0.0.0-increment-1.1.1 (2024-05-07)

### Bug Fixes

* package.json ([2da357c](https://github.com/kyr0/redaktool/commit/2da357c45e1969198b99550974fa33a851790367))


### Documentation

* added missing vectorstore link ([8202d47](https://github.com/kyr0/redaktool/commit/8202d479152d429b5524209aa26552a586b448ac))
* docs formatting ([5ee5fe2](https://github.com/kyr0/redaktool/commit/5ee5fe2d0aa19adcacb04b64456631218db46bc3))
* docs formatting and links ([e84d686](https://github.com/kyr0/redaktool/commit/e84d6869ab1ebbc7db94ea938dad0ba2b0ed2317))
* docs links ([54c3274](https://github.com/kyr0/redaktool/commit/54c32746c99e6a59b5cecbb678d3dba9d0724b1b))
* docs links ([ff25f72](https://github.com/kyr0/redaktool/commit/ff25f727c24bffbb7811e5234b53c643940200e6))

### Features

* preparation of LLM abstraction layer ([5dcb28b](https://github.com/kyr0/redaktool/commit/5dcb28bd42450171336564323f84ea964b6029bb))
* translation, interactive prompt ([37646f3](https://github.com/kyr0/redaktool/commit/37646f3349514e42521bdf00e3d26b1419a69e10))

