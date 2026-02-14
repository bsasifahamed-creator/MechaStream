# Connect MechaStream to GitHub

**Your project is already committed locally.** Follow these steps to put it on GitHub and get your link.

## 1. Create a new repository on GitHub

1. Open: **https://github.com/new**
2. **Repository name:** e.g. `mecha-stream` or `code-dyno`
3. **Public** (or Private)
4. Leave **"Add a README"** unchecked (this project already has one).
5. Click **Create repository**.

## 2. Your repo link

After you create the repo, your link will be:

**https://github.com/YOUR_USERNAME/YOUR_REPO**

Example: **https://github.com/Asif/mecha-stream**

## 3. Connect and push (run in this project folder)

Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Example:
```bash
git remote add origin https://github.com/Asif/mecha-stream.git
git branch -M main
git push -u origin main
```

If GitHub asks you to sign in, use a **Personal Access Token** instead of your password:
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token.
- Give it `repo` scope, then use the token as the password when `git push` asks.

## 4. Using SSH instead of HTTPS

If you use SSH keys with GitHub:

```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

After this, your project is connected to GitHub. Use `git add`, `git commit`, and `git push` to save and push changes.
