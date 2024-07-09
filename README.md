<span align="center">
    <p align="center">
      <img src="./icons/logo.png" width="300" title="RedakTool Logo">
    </p>

  # RedakTool


  ### Browser Extension - for the journalistic work of the future

  <font color="#555">
  
  #### &ndash; IN DEVELOPMENT | PRE-ALPHA &ndash;

  </font>


  [![](https://img.shields.io/badge/features-navy?style=for-the-badge&logo=rocket)](#-features)  [![](https://img.shields.io/badge/usage-magenta?style=for-the-badge&logo=readdotcv)](#-usage)   [![](https://img.shields.io/badge/docs-darkmagenta?style=for-the-badge&logo=readme)](https://github.com/kyr0/redaktool/wiki) [![](https://img.shields.io/badge/contributing-darkslategray?style=for-the-badge&logo=react)](#%EF%B8%8F-contibuting) ![MIT License](https://img.shields.io/github/license/kyr0/ftr-ki-tools?style=for-the-badge) 
  [![](https://dcbadge.vercel.app/api/server/4wR9t7cdWc)](https://discord.gg/4wR9t7cdWc) [![](https://img.shields.io/badge/email-aron-cc0000?style=for-the-badge&logo=maildotru)](mailto:info@aron-homberg.de) [![](https://img.shields.io/badge/acknowledgements-cc0000?style=for-the-badge&logo=undertale)](#%EF%B8%8F-acknowledgements)

</span>

> 🛠️ RedakTool offers a powerful browser extension specifically designed for editors and professionals engaged in text-related research, writing, and evaluation tasks. This tool serves as a comprehensive "AI toolbox" enabling direct interaction with content on any website for extraction, translation, summarization, composition, and proofreading. It includes additional functionalities like a News Radar, transcription services, and robust fact-checking features. Aimed at boosting productivity, the extension streamlines workflows by eliminating the need for multiple tools, thereby reducing the mental burden and decreasing costs through the direct integration of both commercial and open-source AI models. 

> 🔬 Additionally, this project showcases the practical application of cutting-edge AI technologies such as nomic-embed-text-v1 for client-side, in-browser usage (through my open source [`vectorstore`](https://github.com/kyr0/vectorstore/) project), marking a significant step forward in the accessibility and application of advanced AI <strong>without the need for</strong> server-side deployments.

## 🌟 Features
<span align="center">

  ![Screenshot of RedakTool](./docs/images/redaktool_new_ui_3d.png)

</span>

RedakTool offers the following features:

- ✅ **Advanced Text, Image, Table Data Extraction and Archiving**: Allows users to extract content from any website, and save it in Markdown format with a single click. The archive search applies local  vector search to find similar texts.
-  ✅ **AI Translation**: Adapts translations to account for metaphors, style, and target audience considerations.
-  ✅ **AI Summarization**: Focuses on summarizing content based on importance or chronology, suitable for interviews.
-  ✅ **AI Creative Writing**: Assists in rephrasing and styling content.
-  ✅ **AI Transcription**: Provides nearly error-free real-time transcription of audio and video on websites.

AI models supported:
-  ✅ **OpenAI**: Any OpenAI LLM, including GPT-4 and newer models.
-  ✅ **Anthropics**: The whole Claude model-series, including Opus.
-  ✅ **Google**: The whole Gemeni model-series, including 1.5 Pro.
-  ✅ **Cohere**: The whole Command model-series, including Command R Plus.
-  ✅ **Ollama**: All Ollama LLMs, including Llama 3.
-  ✅ **HuggingFace**: All HuggingFace LLMs.

This extension also allows to configure and use locally deployed models, as long as there is an endpoint compatible with the industry-standard OpenAI Messages API interface (fully compatible with OpenAI Chat Completion API).
 
Additional features planned:
-  ✅ **AI Fact-Checking**: Offers fact-checking with minimized errors and simulates human touch and style.
-  ✅ **AI News Radar**: Ingests all news sources, added to the radar via RSS/Atom feeds, applies AI vector similarity algorithms to link similar news.

## 📚 Usage

**Please be aware that this extension is currently in the ALPHA stage and is not ready for general user installation. If you're interested in using the extension at this time, you will need to compile it on your own machine. To do this, please refer to the "Contributing as a Developer" guide provided below.**

**We anticipate moving into the beta testing phase within the next 1-2 months. At that time, the process for installing and using the extension will become more straightforward for general users. Stay tuned for further updates, and thank you for your interest and patience!**

Currently, this extension is tested for compatibility with Chrome and Chromium browsers. 

Here’s how to get started:

- Open your Chrome or Chromium browser.
- Navigate to Extensions. You can do this by typing chrome://extensions into your browser's address bar.
- Click on the Load unpackaged extension button. For German users, this option is labeled "Entpackte Erweiterung laden".
- Select the directory where you've saved the extension files. The extension will then be installed automatically.
Activating the Extension
You can activate the extension on any website in a few simple ways:

- Use the keystroke Alt+F on Windows or Control+F on Mac.
- Alternatively, click on the extension’s menu entry in Chrome's extension dropdown.

### Writing Smart Prompts or: The Smart Prompt Template Language

RedakTool uses "Smart Prompts" to instruct the connected LLMs on what they should do and how it should be done.
Smart Prompts are using the Smart Prompt Templating language, which is a compiled, statically evaluated template language.
The Smart Prompt dialect is based on [Liquid](https://github.com/Shopify/liquid/wiki#who-uses-liquid).

You can think of Smart Prompts like Word macros. Instead of writing a static set of instructions for the LLM,
you can use *variables*, which can be defined by *fields* in the UI. It's also possible to use *logic* like 
 *if*, *else* and *elseif* to make sure, only the right instructions are sent to the LLM, based on *variables* values.
Further more, we sometimes need to explain instructions very explicitly to an LLM. For this, we can use *loops*,
where instead of writing the same instruction with different values again and again, we let the Smart Prompt do so.
Finally, *variables* can be *formatted* using *value filters*, such as rendering them uppercase, lowercase or escaping a string.

To make Smart Prompt templates easy to write, it's keywords are translated into all natural languages supported in the RedakTool UI.

Here is an example of a Smart Prompt:
```liquid
{% # This is a comment. It explains that the following tag configures a UI element that links to the EXAMPLE variable %}
{% field EXAMPLE = "{ label: 'Beispiel', default: '- First topic here.
- Second topic here.
- Third topic here.' }" %}

{% # At next, we write the instructions. We use a very explicit reference to CONTENT, so the LLM knows what we're referring to. %}
You are an expert data analyst, journalist and writer with many years of professional experience. Summarize the CONTENT.

RULES:
{% # only if the field for a custom instruction was filled by the user, this rule will be rendered %}
{% if HAS_CUSTOM_INSTRUCTION %}
- MOST IMPORTANTLY: MUST {{CUSTOM_INSTRUCTION}}
{% endif %}
{% # the USER_LANGUAGE variable is always the value of the UI language you select; for example, German %}
- MUST write the summary in target languge {{USER_LANGUAGE}}
END OF RULES.

EXAMPLE:
{% # Here, instead of this glibberish, the value of the EXAMPLE field will be rendered: %}
{{ EXAMPLE }}
END OF EXAMPLE.

CONTENT:
{% # CONTENT is a variable that is always available. The text that was selected by the user will automatically be filled in here. %}
{{CONTENT}}
```

### Output Variables

Smart Prompts are truly smart. Compiling and evaluating a Smart Prompt allows for setting output variables that can control the
next step's logic flow. Thus, a simple conditon can help approximating correct prices by setting the `OUTPUT_TOKEN_FACTOR` that
is used to multiply the input token count. Some languages tend to use more tokens than others. This way, we can, depending on
the input language, approximate the output tokens cost better:

```liquid
{% # prompt logic to set an output variable, depending on an input variable %}
{% if TARGET_LANGUAGE == "Deutsch" %}
  {% assign OUTPUT_TOKEN_FACTOR = 1.2 %}
{% endif %}
```

## ⚒️ Contibuting

### As a User 
This project, crafted by a writer and software engineer, is designed with you in mind—it thrives on your participation! Your unique insights and contributions can truly enrich this community. If you're willing to share a bit of your valuable time and energy, here are several ways you can make a meaningful impact:

- Share your feedback and thoughts
- Suggest **new prompts** or **refine** existing ones
- Propose new or alternative use cases
- Provide test results, including compatibility, speed, and overall experience
- Report any issues you encounter

Your involvement is invaluable and deeply appreciated!
Please feel free to reach out to me via our Discord channel *(preferred)* or via email.

### As a Developer

You're very welcome to contribute to this project. You may need to install [`bun`](https://bun.sh/) first.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This command will compile a new version of this extension  that you can load in Chrome/Chromium (load unpackaged extension from disk).

Your contributions are welcome!

- **Feature Development**: Extend RedakTool by adding more features and integrations. You may fork this repository, create a new branch, implement another Tab or Menu Entry for your new feature, and open a Pull Request here. Please simply follow the code-style and general architecture of this codebase.
- **Reporting Bugs**: Submit an issue in our repository, providing a detailed description of the problem and steps to reproduce it. A usage video works best.
- **Feature Requests**: Have ideas on how to make this extension better? We'd love to hear from you! Please submit an issue, detailing your suggestions.

### Versioning note

Until end of October 2024, this project will apply a specific versioning scheme, that adds a tag to the semver version: 
`0.0.0-increment-$milestone.$month.$week`. This is, to track and group the progress in `CHANGELOG.md` on a per-milestone, per-month, per-week, basis, in increments.

### Conventional Commits

To organize the work done, alongside it's documentation, every commit follows a the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) policy. This allows for `bun run changelog` to auto-generate the changelog with meaningful process reports every Tuesday evening. 

## Website codebase

The code in this repository represents the implementation of the browser extension only. The code of the [redaktool.ai](https://www.redaktool.ai) website is open source and released under the terms of the MIT license as well and can be found [here](https://github.com/kyr0/redaktool-website).

## ❤️ Acknowledgements

Special thanks to our contributors and supporters, particularly Media Tech Lab, for their invaluable assistance in this project.

<p>
<a href="https://www.media-lab.de/en/programs/media-tech-lab">
    <img src="./icons/mtl.png" width="240" title="Media Tech Lab powered by logo">
</a>
</p>

<p>
  <img src="./icons/ftr_logo.png" width="100" title="FTR: For The Record Newsletter">
  FTR: Newsletter
</p>
