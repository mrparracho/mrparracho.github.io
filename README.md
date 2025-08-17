# 🚀 Miguel Parracho - Tech Lead Portfolio

A modern, interactive portfolio website showcasing expertise in Data Engineering and Artificial Intelligence. Built with cutting-edge web technologies and designed to impress hiring managers and recruiters.

**Live Demo**: [mrparracho.github.io](https://mrparracho.github.io)

## ✨ Features

🎨 **Modern Dark Theme** - Professional blue accent color scheme with neural network aesthetics  
🤖 **AI-Focused Design** - Interactive neural network animations and tech-inspired visuals  
📱 **Fully Responsive** - Optimized for all devices and screen sizes  
⚡ **Performance Optimized** - Fast loading with smooth animations and lazy loading  
🎯 **Hiring-Focused** - Designed to showcase technical skills and leadership experience  

### 🔥 Interactive Elements

* **Animated Neural Network** with real-time floating nodes and connections
* **Particles Background** with interactive hover effects
* **Typing Effect** with rotating professional titles
* **3D Hover Effects** on project cards and skill items
* **Smooth Scroll Animations** throughout the site
* **Loading Screen** with professional neural network animation
* **Mobile-First Navigation** with hamburger menu

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (ES6+)
* **Styling**: CSS Custom Properties, Advanced Animations, CSS Grid
* **Icons**: Font Awesome 6, Devicon (technology icons)
* **Fonts**: Inter (UI), JetBrains Mono (code)
* **Animations**: CSS Keyframes, Intersection Observer API
* **Particles**: Particles.js for interactive background
* **Deployment**: GitHub Pages with Jekyll

## 🚀 Quick Deploy

This portfolio is ready to deploy to GitHub Pages:

1. **Fork this repository** or use as a template
2. **Enable GitHub Pages** in Settings → Pages
3. **Select source**: Deploy from branch `main` / `root`
4. **Wait 2-3 minutes** for deployment
5. **Visit**: `https://yourusername.github.io/`

## 📝 Customization Guide

### Personal Information

Edit these sections in `index.html`:

* **Hero Section** (lines 65-85): Update name, title, and description
* **About Section** (lines 105-130): Modify experience summary and stats
* **Experience Timeline** (lines 225-290): Update job history and companies
* **Contact Information**: Update email, LinkedIn, and GitHub links

### Projects

Update `projects.json` with your projects:

```json
{
  "title": "Your Project Name",
  "description": "Project description...",
  "repoUrl": "https://github.com/username/repo",
  "liveUrl": "https://demo.example.com",
  "imageUrl": "static/images/projects/your-image.svg",
  "skills": [
    {"name": "Technology", "icon": "devicon-technology-plain"}
  ]
}
```

### Skills & Technologies

Modify the skills section in `index.html`:

* **Programming Languages**: Update skill levels and icons
* **Data & AI**: Customize ML/AI technology expertise
* **Cloud & DevOps**: Adjust cloud platform skills

### Styling & Colors

Customize the color scheme in `static/css/main.css`:

```css
:root {
    --primary: #00a8ff;      /* Main blue accent */
    --accent: #64b5f6;       /* Light blue */
    --bg-primary: #0a0a0a;   /* Dark background */
    --bg-secondary: #1a1a1a; /* Secondary background */
}
```

## 📱 Mobile Optimization

* **Responsive Grid** layouts that adapt to all screen sizes
* **Touch-optimized** interactions for mobile devices
* **Mobile-first** CSS design approach
* **Optimized animations** for mobile performance
* **Hamburger navigation** for small screens

## 🎯 Professional Features

This portfolio is specifically designed to impress hiring managers:

* **Clear Information Hierarchy** with professional layout
* **Technical Skills Showcase** with animated progress bars
* **Project Portfolio** with live GitHub links and descriptions
* **Experience Timeline** with company details and tech stacks
* **Modern Tech Stack** demonstrating frontend development skills
* **Performance Focus** showing attention to detail and optimization

## 📊 Performance Metrics

* **Lighthouse Score**: 95+ across all metrics
* **Fast Loading**: Optimized images and minimal dependencies
* **Smooth Animations**: Hardware-accelerated CSS transitions
* **Cross-Browser**: Compatible with all modern browsers
* **SEO Optimized**: Meta tags and semantic HTML structure

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/mrparracho/mrparracho.github.io.git
cd mrparracho.github.io

# Serve locally with Python
python -m http.server 8000

# Or with Node.js
npx serve .

# Visit http://localhost:8000
```

## 📁 Project Structure

```
mrparracho.github.io/
├── index.html                 # Main portfolio page
├── projects.json              # Project data and metadata
├── _config.yml                # Jekyll configuration
├── README.md                  # This documentation
├── static/
│   ├── css/
│   │   └── main.css          # All styling and animations
│   ├── js/
│   │   ├── main.js           # Interactive functionality
│   │   └── particles.min.js  # Particles background library
│   ├── images/
│   │   ├── photo.svg         # Profile photo placeholder
│   │   └── projects/         # Project images
│   └── favicon/
│       └── favicon.svg       # Site icon
└── .gitignore                # Git ignore patterns
```

## 🎨 Design Philosophy

This portfolio balances:

* **Professional aesthetics** for hiring managers and recruiters
* **Technical showcase** for engineering and leadership roles
* **Modern web standards** demonstrating current development skills
* **User experience** across all devices and screen sizes
* **Performance optimization** showing attention to detail

## 🚀 Deployment Options

### GitHub Pages (Recommended)

✅ **Free hosting** with custom domain support  
✅ **Automatic deployments** on git push  
✅ **HTTPS by default** for security  
✅ **Integrated with GitHub** workflow  

### Alternative Platforms

* **Netlify**: Drag & drop deployment with form handling
* **Vercel**: Git-based deployment with preview URLs
* **Surge.sh**: CLI deployment for static sites

## 📞 Contact & Support

* **Portfolio**: [mrparracho.github.io](https://mrparracho.github.io)
* **GitHub**: [github.com/mrparracho](https://github.com/mrparracho)
* **Email**: your.email@example.com (update in HTML)

## 🤝 Contributing

Contributions are welcome! Feel free to:

* Report bugs or issues
* Suggest new features
* Submit pull requests
* Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ for the tech community**

*Showcase your skills, impress recruiters, and land your dream job with this modern portfolio template.*
