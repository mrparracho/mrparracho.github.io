// Template configuration file - This will be replaced during build
// with actual environment variables from GitHub Secrets

// PLACEHOLDER: This file will be replaced during build with actual configuration
// The following placeholders will be replaced:
// - {{ELEVENLABS_API_KEY}} -> Your ElevenLabs API key
// - {{RAG_BACKEND_URL}} -> Your RAG backend URL
// - {{OPENAI_API_KEY}} -> Your OpenAI API key
// - {{PERSONAL_NAME}} -> Your full name
// - {{PERSONAL_EMAIL}} -> Your email address
// - {{PERSONAL_LINKEDIN}} -> Your LinkedIn profile URL

window.APP_CONFIG = {
  // API Keys (injected during build)
  elevenLabsApiKey: 'YOUR_ELEVENLABS_API_KEY_HERE',
  ragBackendUrl: 'YOUR_RAG_BACKEND_URL_HERE',
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  
  // Feature flags (automatically determined)
  features: {
    tts: false, // Will be true if ELEVENLABS_API_KEY is set
    stt: false, // Will be true if ELEVENLABS_API_KEY is set
    rag: false  // Will be true if OPENAI_API_KEY is set
  },
  
  // Personal information (injected during build)
  personalInfo: {
    name: 'YOUR_NAME_HERE',
    email: 'your.email@example.com',
    linkedin: 'https://linkedin.com/in/your-profile'
  },
  
  // Default values for template users
  defaults: {
    name: 'Your Name',
    email: 'your.email@example.com',
    linkedin: 'https://linkedin.com/in/your-profile'
  }
};

// Helper function to get config with fallbacks
window.getConfig = function(key, fallback = '') {
  const keys = key.split('.');
  let value = window.APP_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback;
    }
  }
  
  return value || fallback;
};

// Helper function to check if feature is enabled
window.isFeatureEnabled = function(feature) {
  return window.APP_CONFIG.features[feature] || false;
};
