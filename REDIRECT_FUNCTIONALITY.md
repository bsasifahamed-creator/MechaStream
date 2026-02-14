# Homepage to Code IDE Redirect Functionality

## Overview
When a user enters a prompt on the homepage and sends it, they are automatically redirected to the Code IDE page with their prompt automatically sent to the AI assistant.

## How It Works

### 1. Homepage (MechaStreamChat Component)
- **Location**: `src/components/MechaStreamChat.tsx`
- **Function**: When user sends a prompt, it redirects to `/ide?prompt={encodedPrompt}`
- **Key Changes**:
  - Added `useRouter` from Next.js navigation
  - Modified `handleSend` function to redirect instead of making API call
  - Uses `encodeURIComponent` to safely encode the prompt for URL

### 2. Code IDE Page
- **Location**: `src/app/ide/page.tsx`
- **Function**: Receives the prompt parameter and passes it to AIAssistant
- **Key Changes**:
  - Added `initialPrompt` state to store the prompt from URL
  - Added URL parameter handling for `prompt` parameter
  - Auto-switches to AI tab when there's an initial prompt
  - Clears the prompt from URL to prevent re-triggering

### 3. AI Assistant Component
- **Location**: `src/components/AIAssistant.tsx`
- **Function**: Automatically sends the initial prompt to the AI
- **Key Changes**:
  - Added `initialPrompt` prop to component interface
  - Added `hasProcessedInitialPrompt` state to prevent duplicate sends
  - Added `useEffect` to handle initial prompt processing
  - Created `handleSendWithPrompt` function for reusable prompt sending
  - Auto-sends prompt after 500ms delay for smooth UX

## User Flow

1. **User visits homepage** (`/`)
2. **User enters prompt** in the chat interface
3. **User clicks send** or presses Enter
4. **System redirects** to `/ide?prompt={encodedPrompt}`
5. **Code IDE loads** with prompt parameter
6. **AI tab activates** automatically
7. **Prompt auto-sends** to AI assistant
8. **Code generates** and applies to editor

## Technical Details

### URL Encoding
- Prompts are URL-encoded using `encodeURIComponent()`
- Special characters and spaces are properly handled
- Decoding happens in the IDE page using `decodeURIComponent()`

### State Management
- `initialPrompt` state in IDE page stores the decoded prompt
- `hasProcessedInitialPrompt` prevents duplicate processing
- URL is cleaned after processing to prevent re-triggering

### Error Handling
- Try-catch blocks around URL parameter processing
- Console logging for debugging
- Graceful fallback if prompt processing fails

## Benefits

1. **Seamless UX**: Users don't need to manually navigate to IDE
2. **Context Preservation**: Prompt is automatically sent to AI
3. **Mobile Friendly**: Works on both desktop and mobile layouts
4. **Error Resilient**: Handles malformed URLs gracefully
5. **Performance**: No unnecessary API calls on homepage

## Testing

### Manual Testing
1. Visit `http://localhost:3000`
2. Enter a prompt like "create me a calculator"
3. Click send
4. Should redirect to `/ide?prompt=create%20me%20a%20calculator`
5. AI should automatically send the prompt and generate code

### URL Testing
- Test with special characters: `create me a "hello world" app`
- Test with spaces: `build a todo list`
- Test with unicode: `create a calculator with emoji 🧮`

## Future Enhancements

1. **Feature Preservation**: Could pass enabled features from homepage
2. **History**: Could store recent prompts in localStorage
3. **Analytics**: Track redirect patterns for UX optimization
4. **Customization**: Allow users to choose redirect behavior 