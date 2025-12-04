# AI Integration Setup Guide

## Step 1: Install Dependencies

First, install the OpenAI package:

```bash
npm install openai
```

## Step 2: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your API key (it starts with `sk-`)

## Step 3: Add API Key to Environment Variables

Create a file named `.env.local` in the root of your project (same level as `package.json`):

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual API key.

**Important:** 
- Never commit `.env.local` to git (it should already be in `.gitignore`)
- The `.env.local` file is for local development only

## Step 4: Restart Your Development Server

After creating `.env.local`, restart your Next.js development server:

```bash
npm run dev
```

## How It Works

1. When a user clicks "Get Feedback" in the EssayForm, it calls `/api/feedback`
2. The API route uses OpenAI to:
   - Generate IELTS scores and feedback
   - Identify specific phrases that need improvement or are good
3. The feedback and highlights are saved to localStorage and displayed in the FeedbackCard

## API Route Location

The API route is located at: `app/api/feedback/route.ts`

## Troubleshooting

- **"OpenAI API key is not configured"**: Make sure `.env.local` exists and contains `OPENAI_API_KEY=sk-...`
- **"Failed to generate feedback"**: Check your API key is valid and you have credits in your OpenAI account
- **CORS errors**: The API route runs server-side, so CORS shouldn't be an issue

