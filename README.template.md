# 🚀 [Your Name] - Portfolio Template

A modern, interactive portfolio website showcasing expertise in [Your Specialization]. Built with cutting-edge web technologies and designed to impress hiring managers and recruiters.

**Live Demo**: [yourusername.github.io](https://yourusername.github.io)

## ✨ Features

🎨 **Modern Dark Theme** - Professional [color] accent color scheme with neural network aesthetics  
🤖 **AI-Focused Design** - Interactive neural network animations and tech-inspired visuals  
📱 **Fully Responsive** - Optimized for all devices and screen sizes  
⚡ **Performance Optimized** - Fast loading with smooth animations and lazy loading  
🎯 **Hiring-Focused** - Designed to showcase technical skills and leadership experience  
🔊 **Voice Integration** - ElevenLabs TTS/STT for interactive voice features  
🧠 **AI Chat Assistant** - RAG-powered portfolio assistant with OpenAI integration  

### 🔥 Interactive Elements

* **Animated Neural Network** with real-time floating nodes and connections
* **Particles Background** with interactive hover effects
* **Typing Effect** with rotating professional titles
* **3D Hover Effects** on project cards and skill items
* **Smooth Scroll Animations** throughout the site
* **Loading Screen** with professional neural network animation
* **Mobile-First Navigation** with hamburger menu
* **Voice-Enabled Chat** with AI portfolio assistant

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (ES6+)
* **Styling**: CSS Custom Properties, Advanced Animations, CSS Grid
* **Icons**: Font Awesome 6, Devicon (technology icons)
* **Fonts**: Inter (UI), JetBrains Mono (code)
* **Animations**: CSS Keyframes, Intersection Observer API
* **Particles**: Particles.js for interactive background
* **AI Integration**: ElevenLabs TTS/STT, OpenAI GPT-4, RAG system
* **Deployment**: GitHub Pages with automated builds

## 🚀 Quick Deploy

This portfolio is ready to deploy to GitHub Pages:

1. **Fork this repository** or use as a template
2. **Set up GitHub Secrets** in Settings → Secrets and variables → Actions:
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `RAG_BACKEND_URL`: Your backend URL (optional)
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `PERSONAL_NAME`: Your full name
   - `PERSONAL_EMAIL`: Your email address
   - `PERSONAL_LINKEDIN`: Your LinkedIn profile URL
3. **Enable GitHub Pages** in Settings → Pages
4. **Select source**: Deploy from branch `gh-pages`
5. **Wait for build** to complete (check Actions tab)
6. **Visit**: `https://yourusername.github.io`

### 🔧 Template Customization

The build process automatically customizes your portfolio:

- **Personal Information**: Name, email, and LinkedIn profile
- **Content Security Policy**: RAG backend URL integration
- **Configuration**: API keys and feature flags
- **HTML Content**: Dynamic title and meta tags
- **RAG System**: Documents ingested via backend UI (not stored in repo)

All customization happens during the GitHub Actions build, keeping your repository clean and template-ready.

## 📝 Customization Guide

### Personal Information

The portfolio automatically uses information from your GitHub Secrets. To customize:

1. **Update GitHub Secrets** with your information
2. **Push to main branch** to trigger rebuild
3. **Personal information** will be automatically injected

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
    --primary: #00a8ff;      /* Main accent color */
    --accent: #64b5f6;       /* Light accent */
    --bg-primary: #0a0a0a;   /* Dark background */
    --bg-secondary: #1a1a1a; /* Secondary background */
}
```

## 🔧 Backend Setup (Optional)

For RAG functionality, deploy the included FastAPI backend:

1. **Navigate to backend directory**: `cd backend/fastapi-rag`
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Set environment variables**:
   ```bash
   OPENAI_API_KEY=your_openai_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ```
4. **Run the server**: `uvicorn app.main:app --reload`
5. **Update RAG_BACKEND_URL** in GitHub Secrets
6. **Access RAG Manager**: Visit `/rag-manager` for document management

### RAG Document Management
After deployment, users can:
- **Upload documents** via the web UI at `/rag-manager`
- **Manage knowledge base** with drag-and-drop interface
- **Monitor statistics** and collection health
- **Perform operations** like re-ingestion and reset

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
* **AI Integration** showcasing cutting-edge technology skills

## 📊 Performance Metrics

* **Lighthouse Score**: 95+ across all metrics
* **Fast Loading**: Optimized images and minimal dependencies
* **Smooth Animations**: Hardware-accelerated CSS transitions
* **Cross-Browser**: Compatible with all modern browsers
* **SEO Optimized**: Meta tags and semantic HTML structure

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-template.git
cd portfolio-template

# Install dependencies
npm install

# Serve locally
npm run dev

# Or with Python
python -m http.server 8000

# Visit http://localhost:8000
```

## 📁 Project Structure

```
portfolio-template/
├── index.html                 # Main portfolio page
├── projects.json              # Project data and metadata
├── package.json               # Node.js dependencies
├── .github/workflows/         # GitHub Actions build workflow
├── README.template.md         # This template file
├── static/
│   ├── css/
│   │   └── main.css          # All styling and animations
│   ├── js/
│   │   ├── main.js           # Interactive functionality
│   │   ├── config.template.js # Configuration template
│   │   ├── rag-chat.js       # RAG chat functionality
│   │   └── elevenlabs-integration.js # Voice features
│   ├── images/
│   │   ├── photo.svg         # Profile photo placeholder
│   │   └── projects/         # Project images
│   └── favicon/
│       └── favicon.svg       # Site icon
├── backend/                   # Optional FastAPI backend
└── .gitignore                # Git ignore patterns
```

## 🎨 Design Philosophy

This portfolio balances:

* **Professional aesthetics** for hiring managers and recruiters
* **Technical showcase** for engineering and leadership roles
* **Modern web standards** demonstrating current development skills
* **User experience** across all devices and screen sizes
* **Performance optimization** showing attention to detail
* **AI integration** showcasing cutting-edge technology skills

## 🚀 Deployment Options

### GitHub Pages (Recommended)

✅ **Free hosting** with custom domain support  
✅ **Automatic deployments** on git push  
✅ **HTTPS by default** for security  
✅ **Integrated with GitHub** workflow  
✅ **Environment-based configuration** via GitHub Secrets  

### Alternative Platforms

* **Netlify**: Drag & drop deployment with form handling
* **Vercel**: Git-based deployment with preview URLs
* **Surge.sh**: CLI deployment for static sites

## 🔒 Security Features

* **No hardcoded API keys** in repository
* **Environment-based configuration** via GitHub Secrets
* **Secure API key injection** during build time
* **Personal information protection** through environment variables
* **Clean repository** safe for open source

## 📞 Contact & Support

* **Portfolio**: [yourusername.github.io](https://yourusername.github.io)
* **GitHub**: [github.com/yourusername](https://github.com/yourusername)
* **Email**: [your.email@example.com](mailto:your.email@example.com)

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

## 🔄 Migration from Personal Portfolio

If you're migrating from a personal portfolio:

1. **Backup your personal data** (CV, FAQ, etc.)
2. **Set up GitHub Secrets** with your information
3. **Push to trigger rebuild** with your data
4. **Verify functionality** on deployed site
5. **Clean up repository** by removing personal files

## 🎯 Next Steps

1. **Fork this repository**
2. **Set up GitHub Secrets** with your information
3. **Customize projects.json** with your projects
4. **Deploy to GitHub Pages**
5. **Share your portfolio** with the world!

---

**Happy coding! 🚀**
