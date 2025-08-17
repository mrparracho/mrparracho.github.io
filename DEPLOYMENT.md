# 🚀 Deployment Guide

## GitHub Pages Deployment

### Step 1: Repository Setup

1. **Fork or Clone** this repository to your GitHub account
2. **Rename** the repository to `yourusername.github.io`
3. **Ensure** the repository is public

### Step 2: Enable GitHub Pages

1. Go to your repository **Settings**
2. Navigate to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **root** folder
5. Click **Save**

### Step 3: Customize Your Portfolio

#### Update Personal Information

1. **Edit `index.html`**:
   - Update name, title, and description
   - Modify experience timeline
   - Change contact information

2. **Edit `projects.json`**:
   - Add your own projects
   - Update GitHub repository links
   - Customize project descriptions

3. **Update `_config.yml`**:
   - Change title and description
   - Update author information
   - Modify URL settings

#### Customize Styling

1. **Edit `static/css/main.css`**:
   - Modify color scheme in `:root` variables
   - Adjust animations and transitions
   - Customize responsive breakpoints

### Step 4: Add Your Content

#### Profile Photo

1. **Replace** `static/images/photo.svg` with your actual photo
2. **Recommended size**: 300x300 pixels
3. **Format**: JPG, PNG, or SVG

#### Project Images

1. **Add** your project screenshots to `static/images/projects/`
2. **Update** `projects.json` with correct image paths
3. **Recommended size**: 400x200 pixels

#### Skills & Technologies

1. **Modify** the skills section in `index.html`
2. **Adjust** skill levels (0-100%)
3. **Add/remove** technology icons as needed

### Step 5: Test Locally

```bash
# Clone your repository
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io

# Serve locally
python3 -m http.server 8000

# Visit http://localhost:8000
```

### Step 6: Deploy

1. **Commit** your changes:
   ```bash
   git add .
   git commit -m "Customize portfolio with personal information"
   git push origin main
   ```

2. **Wait 2-3 minutes** for GitHub Pages to build and deploy

3. **Visit** `https://yourusername.github.io`

## Custom Domain Setup

### Step 1: Purchase Domain

1. **Buy** a domain from a registrar (Namecheap, GoDaddy, etc.)
2. **Ensure** DNS management is available

### Step 2: Configure DNS

1. **Add** these DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

2. **Add** CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```

### Step 3: Update Repository

1. **Go** to repository Settings → Pages
2. **Enter** your custom domain
3. **Check** "Enforce HTTPS"
4. **Save** the changes

### Step 4: Update Configuration

1. **Edit** `_config.yml`:
   ```yaml
   url: https://yourdomain.com
   baseurl: ""
   ```

2. **Create** `CNAME` file in root directory:
   ```
   yourdomain.com
   ```

## Troubleshooting

### Common Issues

1. **Page not loading**: Check if GitHub Pages is enabled
2. **Styling broken**: Verify CSS file paths are correct
3. **Images not showing**: Check image file paths and formats
4. **JavaScript errors**: Ensure all JS files are properly linked

### Performance Optimization

1. **Optimize images** before uploading
2. **Minify CSS/JS** for production
3. **Use WebP format** for images when possible
4. **Enable GZIP compression** on your server

### SEO Optimization

1. **Update meta tags** in `index.html`
2. **Add structured data** for better search results
3. **Create sitemap.xml** for search engines
4. **Optimize page titles** and descriptions

## Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check the main README.md
- **Community**: Ask questions in GitHub Discussions

---

**Happy Deploying! 🎉**
