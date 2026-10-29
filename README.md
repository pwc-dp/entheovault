# EntheoVault

<div align="center">

  ![banner](./public/readme-banner.png)

</div>

[EntheoVault](https://entheovault.com/) serves as a comprehensive hub, offering research papers, insights, and educational resources for psychedelics.

This project is back and maintained by **Taiwan Psychedelic Association**, a group of individuals dedicated to promoting the safe and responsible use of psychedelics, as well as advocating for de-demonizing of these substances. If you are interested in psychedelics or this project, feel free to [join us](https://tinyurl.com/3fr2ddu7)!

This project is built on top of [Next.js](https://nextjs.org/), with [Payload](https://payloadcms.com/) v2 served as data source and content management system, and [PsycheLens](https://entheovault.com/research) leverages the power of LLM (e.g. gpt-4o/gemini) to information summarization and data retrieval (mainly with research papers).

## Site Structure

- [**Learn / 知識指南**](https://entheovault.com/learn): Guides with research citations and links to the literature. Substance guides are available directly under `/learn/<slug>`.
- [**Database**](https://entheovault.com/database): Educational materials to enhance understanding of therapeutic usage of psychedelics.
- [**Research**](https://entheovault.com/research): A collection of research papers and articles on psychedelics and beyond. Research papers are stored in vector database for performing retrieval-augmented generation (PsycheLens).
- [**About**](https://entheovault.com/about): *acinteyya*

## Contributing

We're more than happy to welcome contributions from the community! If you are interested in contributing to this project or to the community, feel free to [reach out to us](https://tinyurl.com/3fr2ddu7).
