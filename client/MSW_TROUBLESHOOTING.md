# MSW Troubleshooting Guide

## ✅ Fixed Issues

The MSW service worker error has been resolved by:
1. ✅ Generated `mockServiceWorker.js` in the `public/` directory
2. ✅ Updated MSW server configuration to use the correct service worker path
3. ✅ Added error handling for MSW initialization

## 🔧 If You Still See Errors

### 1. Clear Service Worker Cache

If you still see the error after the fix, clear the service worker cache:

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** for any registered service workers
5. Refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

**Firefox:**
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** for any registered service workers
5. Refresh the page

### 2. Hard Refresh

After clearing service workers, do a hard refresh:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 3. Verify File Exists

Check that `client/public/mockServiceWorker.js` exists:
```bash
ls client/public/mockServiceWorker.js
```

If it doesn't exist, regenerate it:
```bash
cd client
npx msw init public/ --save
```

### 4. Check Browser Console

Open browser DevTools Console and look for:
- ✅ `✅ MSW worker started successfully` - MSW is working
- ⚠️ `⚠️ MSW failed to start` - Check the error message

### 5. Verify Vite is Serving the File

1. Start the dev server: `pnpm dev`
2. Open browser: `http://localhost:3000/mockServiceWorker.js`
3. You should see the JavaScript code (not HTML)

If you see HTML instead, the file isn't being served correctly.

## 📝 Expected Behavior

When MSW is working correctly:
- Browser console shows: `✅ MSW worker started successfully`
- Network requests are intercepted (check Network tab in DevTools)
- API calls show as "mocked" or "intercepted" in the console
- Login/Register functionality works with mock data

## 🚀 Quick Fix Commands

```bash
# Regenerate service worker
cd client
npx msw init public/ --save

# Restart dev server
pnpm dev
```

## 🔍 Common Error Messages

| Error | Solution |
|-------|----------|
| `Failed to register Service Worker` | Clear service worker cache and hard refresh |
| `The script has an unsupported MIME type` | File exists but not served correctly - restart dev server |
| `404 on mockServiceWorker.js` | Regenerate file: `npx msw init public/ --save` |
| `MSW failed to start` | Check browser console for specific error |
