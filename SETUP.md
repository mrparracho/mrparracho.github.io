# 🚀 Portfolio Template Setup Guide

## 🎯 What This Template Provides

This is a **fully customizable portfolio template** with AI features that:

- ✅ **No personal information** stored in repository
- ✅ **Fully configurable** via GitHub Secrets
- ✅ **AI-powered features** (TTS, STT, RAG)
- ✅ **Template-ready** for open source
- ✅ **Secure deployment** with no hardcoded secrets

## 🔑 Required GitHub Secrets

### **Essential (Required for Full Functionality)**
```yaml
# Voice Features
ELEVENLABS_API_KEY=sk-your-elevenlabs-key-here

# Personal Information
PERSONAL_NAME=Your Full Name
PERSONAL_EMAIL=your.email@example.com
PERSONAL_LINKEDIN=https://linkedin.com/in/your-profile
```

### **Optional (For Advanced Features)**
```yaml
# AI Chat Features
RAG_BACKEND_URL=https://your-backend-url.com
OPENAI_API_KEY=sk-your-openai-key-here
```

## 🚀 Quick Setup

### **1. Fork This Repository**
- Click "Use this template" or fork the repo
- Clone to your local machine

### **2. Set GitHub Secrets**
Go to your repository → Settings → Secrets and variables → Actions:

```bash
# Required
ELEVENLABS_API_KEY=sk-your-actual-key
PERSONAL_NAME=Your Actual Name
PERSONAL_EMAIL=your.actual@email.com
PERSONAL_LINKEDIN=https://linkedin.com/in/your-actual-profile

# Optional
RAG_BACKEND_URL=https://your-backend.com
OPENAI_API_KEY=sk-your-openai-key
```

### **3. Enable GitHub Pages**
- Go to Settings → Pages
- Source: Deploy from branch `gh-pages`
- Wait for build to complete

### **4. Customize Content**
- Update `projects.json` with your projects
- Modify `static/css/main.css` for styling
- Add your own images to `static/images/`

## 🔧 How It Works

### **Build Process**
1. **GitHub Actions** runs on every push
2. **Secrets are injected** into configuration files
3. **HTML is customized** with your information
4. **Site deploys** to GitHub Pages

### **Template Features**
- **Voice Integration**: ElevenLabs TTS/STT
- **AI Chat**: OpenAI-powered portfolio assistant
- **Modern Design**: Neural network aesthetics
- **Responsive**: Mobile-first approach
- **Performance**: Optimized animations

## 📚 Document Management

### **For RAG System (Optional)**
- **Documents are NOT stored** in repository
- **Use backend UI** to upload your CV, projects, etc.
- **System automatically** chunks and embeds documents
- **Personal data stays** in your backend only

### **What Gets Customized**
- ✅ **Portfolio content** (projects, skills, about)
- ✅ **Personal information** (name, email, LinkedIn)
- ✅ **Styling and branding**
- ✅ **AI feature configuration**

### **What Stays Generic**
- 🔒 **Document templates** (CV, FAQ examples)
- 🔒 **Code structure** and architecture
- 🔒 **Feature implementations**
- 🔒 **Security and deployment**

## 🎨 Customization Options

### **Easy Customization**
- **Projects**: Edit `projects.json`
- **Skills**: Modify `index.html` skills section
- **Colors**: Update CSS variables in `main.css`
- **Content**: Edit sections in `index.html`

### **Advanced Customization**
- **Backend**: Deploy your own FastAPI server
- **AI Features**: Customize RAG system
- **Voice**: Configure ElevenLabs voices
- **Styling**: Modify CSS and animations

## 🔒 Security Features

- **No API keys** in repository
- **No personal documents** stored
- **Environment-based** configuration
- **Secure build** process
- **Template-ready** for open source

## 🚀 Deployment Options

### **GitHub Pages (Recommended)**
- ✅ **Free hosting**
- ✅ **Automatic deployment**
- ✅ **HTTPS by default**
- ✅ **Custom domain support**

### **Alternative Platforms**
- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **Surge.sh**: CLI deployment

## 📝 Next Steps

1. **Set up GitHub Secrets** with your information
2. **Push changes** to trigger build
3. **Verify deployment** on GitHub Pages
4. **Customize content** for your portfolio
5. **Share your portfolio** with the world!

## 🆘 Need Help?

- **Check Actions tab** for build logs
- **Review GitHub Secrets** configuration
- **Verify file paths** and permissions
- **Check browser console** for errors

---

**Happy coding! 🚀**

Your portfolio will be automatically customized with your information while keeping the repository clean and template-ready for others.
