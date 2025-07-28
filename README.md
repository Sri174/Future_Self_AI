# 🔮 FutureSelf AI - Career Visualization Platform

An AI-powered platform that helps students visualize their future careers through personalized assessments and AI-generated imagery.

## ✨ Features

- 📝 **Interactive MCQ Assessment** - Personality and career interest evaluation
- 🤖 **AI-Powered Analysis** - Intelligent career suggestions based on responses
- 📸 **Photo Upload & Processing** - Personal photo integration for future self visualization
- 🎨 **AI Image Generation** - Profession-specific future self imagery with accurate environment matching
- 💼 **Career Matching** - Precise profession-environment alignment (Social Worker → Community center, Doctor → Hospital, etc.)
- 📱 **Responsive Design** - Works seamlessly across all devices

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Deployment Preparation
```bash
npm run prepare-deploy
```

## 🌐 Netlify Deployment

This project is **fully configured** for Netlify deployment with serverless functions.

### Quick Deploy Steps:
1. **Get Google AI API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Push to Git** repository (GitHub/GitLab/Bitbucket)
3. **Connect to Netlify** and set environment variable: `GOOGLE_GENAI_API_KEY`
4. **Deploy!** 🚀

📖 **Detailed Guide**: See `NETLIFY_DEPLOYMENT_GUIDE.md`

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI**: Google Gemini (Text & Image Generation)
- **Deployment**: Netlify Functions (Serverless)
- **UI Components**: Radix UI, Lucide Icons

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utility functions & API calls
│   └── hooks/               # Custom React hooks
├── netlify/
│   └── functions/           # Serverless functions
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🔧 Environment Variables

```env
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

## 🎯 Key Features Implementation

### Profession-Specific Image Generation
- **Social Worker** → Community center, client meetings, NO medical equipment
- **Doctor** → Hospital/clinic with stethoscope and medical equipment
- **Environmental Scientist** → Outdoor research, nature settings
- **Teacher** → Classroom with educational materials

### API Endpoints
- `/api/answer-mcq-questions` - MCQ analysis and career suggestions
- `/api/generate-future-self` - Future self visualization generation
- `/api/generate-mcq-questions` - Dynamic question generation

## 📊 Performance

- ⚡ **Fast Loading** - Optimized Next.js build
- 🔄 **Serverless** - Auto-scaling Netlify Functions
- 📱 **Mobile Optimized** - Responsive design
- 🎨 **Image Optimization** - Efficient image handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to deploy?** Run `npm run prepare-deploy` to check your setup!
