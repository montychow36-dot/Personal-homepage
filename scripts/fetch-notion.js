name: Deploy Vite Site to Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:
  schedule:
    # 每天自動定時從 Notion 同步一次資料
    - cron: '0 2 * * *'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    # 同步開啟 github-pages 環境權限，確保 Environment secrets 能被讀取
    environment:
      name: github-pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Fetch Notion Data
        env:
          NOTION_API_KEY: ${{ secrets.NOTION_API_KEY || vars.NOTION_API_KEY || secrets.NOTION_TOKEN || vars.NOTION_TOKEN || secrets.NOTION_KEY || vars.NOTION_KEY || secrets.NOTION_SECRET || vars.NOTION_SECRET || secrets.NOTION || vars.NOTION || secrets.githubHomepage || vars.githubHomepage }}
          NOTION_DATABASE_ID: ${{ secrets.NOTION_DATABASE_ID || vars.NOTION_DATABASE_ID || secrets.DATABASE_ID || vars.DATABASE_ID }}
        run: |
          if [ -f "scripts/fetch-notion.js" ]; then
            node scripts/fetch-notion.js
          else
            echo "Notice: scripts/fetch-notion.js not found yet, skipping Notion fetch."
          fi

      - name: Build site
        run: npx vite build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
