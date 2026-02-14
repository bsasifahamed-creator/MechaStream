# Connect MechaStream to GitHub

## 1. Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Repository name: e.g. `mecha-stream` or `code-dyno`.
3. Choose **Public** (or Private).
4. **Do not** add a README, .gitignore, or license (this project already has them).
5. Click **Create repository**.

## 2. Connect this folder to your GitHub repo

In a terminal, from this project folder run (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

Example:
```bash
git remote add origin https://github.com/Asif/mecha-stream.git
```

## 3. First commit and push

```bash
git add .
git commit -m "Initial commit: MechaStream app"
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
