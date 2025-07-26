Project Title: "Spanish in Song" - Interactive Web Curriculum

High-Level Goal:
Initialize a complete project for a web application that presents a Spanish language curriculum based on original songs. The project should include the website's source code and all the curriculum content in separate Markdown files, organized by module and song. Two versions of the curriculum content must be generated: one with the original English/Spanish mix, and another translated to be Spanish-only.

1. Technology Stack:

Framework: React (using Vite for a fast setup)

Language: JavaScript (JSX)

Styling: Tailwind CSS for utility-first styling.

Routing: react-router-dom

Markdown Rendering: react-markdown to display the curriculum files.

2. Project File Structure:
Please generate the following directory and file structure. Create empty files for now where content is not specified.

spanish-in-song/
├── public/
│   └── curriculum/
│       ├── en-es/  // Original English/Spanish Version
│       │   ├── module-1/
│       │   │   ├── song-1-1.md
│       │   │   └── song-1-2.md
│       │   ├── module-2/
│       │   │   ├── song-2-1.md
│       │   │   ├── song-2-2.md
│       │   │   └── song-2-3.md
│       │   ├── module-3/
│       │   │   ├── song-3-1.md
│       │   │   ├── song-3-2.md
│       │   │   └── song-3-3.md
│       │   ├── module-4/
│       │   │   ├── song-4-1.md
│       │   │   ├── song-4-2.md
│       │   │   └── song-4-3.md
│       │   ├── module-5/
│       │   │   ├── song-5-1.md
│       │   │   ├── song-5-2.md
│       │   │   └── song-5-3.md
│       │   └── module-6/
│       │       ├── song-6-1.md
│       │       ├── song-6-2.md
│       │       └── song-6-3.md
│       └── es-only/ // 100% Spanish Version
│           ├── module-1/
│           │   ├── song-1-1.md
│           │   └── song-1-2.md
│           ├── module-2/
│           //... (and so on for all modules and songs)
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ModuleAccordion.jsx
│   │   └── SongViewer.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── CurriculumPage.jsx
│   │   └── AboutPage.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├──.gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
3. Content Generation - Curriculum Markdown Files:

A. For the en-es (Original Version) folder:
Populate each song-X-Y.md file using the content from the "Spanish in Song" Curriculum Report provided below. Use the following template for each file:

Markdown

#

**Module:** [Module Number and Name]
**Musical Style:**

## Learning Objectives

- [Objective 1]
- [Objective 2]
- [Objective 3]
-...

## Lyrics


B. For the es-only (Spanish-Only Version) folder:
This is a critical transformation task. For each song, create the Spanish-only version based on the original lyrics by following these rules:

Keep all lines that are already 100% in Spanish.

Remove all lines that are 100% in English (commentaries, translations).

For lines that mix English and Spanish, remove the English part and keep only the Spanish part. If a line is primarily an English explanation with a Spanish word, remove the entire line.

The goal is to have a coherent set of lyrics purely in Spanish.

Example of transformation for song-1-1.md:

Original (en-es version):

(Verse 1)
I walk down the street, it's a beautiful day
The sun is shining, *el sol brilla*, come what may
I see you and I say, with a great big smile
A simple question, just for a while
*¡Hola!*
Transformed (es-only version):

(Verse 1)
*El sol brilla.*
*¡Hola!*
Please apply this transformation logic to generate all the files in the /public/curriculum/es-only/ directory.

4. Content Generation - React Components:

