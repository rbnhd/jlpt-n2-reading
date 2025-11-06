# JLPT N2 Reading Practice Site

A comprehensive static website for JLPT N2 reading comprehension practice, featuring authentic passages, extensive vocabulary and grammar resources, and progress tracking. Built with vanilla HTML/CSS/JavaScript for deployment on GitHub Pages. Access [here](https://rbnhd.github.io/jlpt-n2-reading/)

## Features

- **15 Reading Passages**: Covering all 5 JLPT N2 question types (短文, 中文, 統合理解, 主張理解, 情報検索)
- **1,600 Vocabulary Entries**: 8 thematic categories with example sentences and translations
- **100 Grammar Patterns**: Complete N2 grammar reference with formation rules and examples
- **Progress Tracking**: Local storage-based tracking of practice sessions, accuracy, and streaks
- **Study Resources**: Tips, strategies, and external resource links
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Privacy-First**: All data stored locally in browser, no server-side tracking

## Project Structure

```
jlpt-n2-reading/
├── index.html                  # Homepage with navigation and stats
├── pages/
│   ├── practice.html          # Practice interface
│   ├── vocabulary.html        # Vocabulary study with search/filters
│   ├── grammar.html           # Grammar reference
│   ├── progress.html          # Progress tracking and statistics
│   ├── tips.html              # Study strategies and tips
│   ├── about.html             # Site information
│   └── privacy.html           # Privacy policy
├── css/
│   ├── style.css              # Core styles and variables
│   └── components.css         # Component-specific styles
├── js/
│   ├── app.js                 # Main navigation and routing
│   ├── practice.js            # Practice session logic
│   ├── quiz-handler.js        # Question handling and scoring
│   └── progress-tracker.js    # LocalStorage progress management
└── data/
    ├── passages/              # 15 reading passages (n2-reading-001.json to 015)
    ├── vocabulary/            # 8 vocabulary files (200 entries each)
    ├── grammar/               # Grammar patterns (100 patterns)
    ├── templates/             # Question type schemas
    └── metadata/              # Content index and metadata
```

## Content Overview

### Reading Passages (15 total)
- **Short Passages (短文)**: 5 passages, 250-350 characters
- **Medium Passages (中文)**: 6 passages, 550-750 characters
- **Integrated Comprehension (統合理解)**: 2 passages
- **Opinion Comprehension (主張理解)**: 3 passages
- **Information Retrieval (情報検索)**: 2 passages

### Vocabulary (1,600 entries across 8 categories)
- Social/Culture (vocab-social.json): 200 entries
- Daily Life (vocab-daily.json): 200 entries
- Business (vocab-business.json): 200 entries
- Academic (vocab-academic.json): 200 entries
- Abstract Concepts (vocab-abstract.json): 200 entries
- Abstract Concepts Extended (vocab-abstract-concepts.json): 200 entries
- Daily Activities (vocab-daily-life.json): 200 entries
- Technology (vocab-technology.json): 200 entries

### Grammar (100 patterns)
- Complete N2 grammar reference (g001-g100)
- Formation rules, meanings, examples, and notes

## Setup & Deployment

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jlpt-n2-reading.git
cd jlpt-n2-reading
```

2. Serve locally (use any static server):
```bash
# Python 3
python3 -m http.server 8000

# Node.js (with http-server)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

3. Open in browser: `http://localhost:8000`

### GitHub Pages Deployment

1. Push to GitHub repository
2. Go to Settings → Pages
3. Set Source to "Deploy from branch"
4. Select branch: `main`, folder: `/ (root)`
5. Save and wait for deployment
6. Access at: `https://yourusername.github.io/jlpt-n2-reading/`

## Data Storage

All user progress is stored in browser `localStorage` with key: `n2-reading-progress`

Stored data includes:
- Practice session history
- Total questions attempted and correct answers
- Study streaks and last study date
- Category-specific performance

**Note**: Data is stored locally in your browser only. Clearing browser data will reset progress.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 modules)
- **Fonts**: Noto Sans JP (Google Fonts)
- **Storage**: Browser localStorage
- **Hosting**: GitHub Pages (static site)
- **No Dependencies**: Pure vanilla JS, no frameworks or libraries

## Usage Guide

1. **Start Practice**: Click "練習を始める" on homepage or select a category
2. **Answer Questions**: Read passage and select answers
3. **Check Results**: Submit to see score and explanations
4. **Track Progress**: View statistics on Progress page
5. **Study Resources**: Use Vocabulary and Grammar pages for review

## Customization

### Color Scheme
Edit CSS variables in `css/style.css`:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
}
```

### Adding Content
- **Passages**: Add JSON files to `data/passages/`
- **Vocabulary**: Add entries to vocabulary JSON files
- **Grammar**: Add patterns to `grammar-n2-complete.json`

## Verification & Quality

- All 25 JSON files validated (passages, vocab, grammar, metadata)
- All 8 HTML pages functional (home + 7 subpages)
- Responsive design tested on multiple screen sizes
- No console errors in browser
- LocalStorage persistence verified
- All navigation links working

## External Resources Referenced

- [Official JLPT Sample Questions (N2)](https://www.jlpt.jp/samples/pdf/N2-mondai.pdf)
- [JLPT Sample 2012 Reading](https://www.jlpt.jp/samples/pdf/N2R.pdf)
- [NHK News Web Easy](https://www3.nhk.or.jp/news/easy/)
- Additional resources listed in Tips page

## License

This project is for personal educational use. Content is based on JLPT N2 standards but is not official JLPT material.

## Contributing

This is a personal project, but suggestions are welcome via Issues.

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Note**: This site is intended for personal study and is not affiliated with the official JLPT organization.