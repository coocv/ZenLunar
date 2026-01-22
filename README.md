# ZenLunar Calendar (禅历) 🌖

> 传统文化与现代 AI 的优雅融合。一个唯美、智能、可高度定制的中国农历应用。

**ZenLunar** 不仅仅是一个日历，它是你的生活助手。它将精准的中国传统农历数据与 Google Gemini AI 的强大能力相结合，提供每日运势指引、智能星座解读、动态天气背景以及个性化的日程管理功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-3.0-38bdf8)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8e75b2)

## ✨ 核心功能

### 📅 深度农历与传统文化
*   **精准农历**: 显示农历日期、干支纪年、生肖。
*   **节气与节日**: 涵盖二十四节气、中国传统节日、民俗节日（如接神、祭灶）及国际节日。
*   **黄历宜忌**: 每日“宜”与“忌”查询，支持点击查看详细术语解释（如“纳采”、“动土”）。

### 🤖 AI 智能赋能 (Powered by Google Gemini)
*   **每日运势**: AI 生成充满禅意的每日指引、历史上的今天、幸运色与幸运数字。
*   **智能星座**: 结合日期与星象，生成独一无二的当日星座运势。
*   **AI 主题生成**: 描述你想要的感觉（如“赛博朋克霓虹”或“雨后森林”），AI 自动生成全套 UI 配色方案。

### 🎨 沉浸式视觉体验
*   **四季流转**: 根据当前月份自动切换春（樱花）、夏（微风）、秋（落叶）、冬（飘雪）动态粒子背景。
*   **玻璃拟态 UI**: 现代化的 Glassmorphism 设计风格，精致的磨砂质感与阴影细节。
*   **完全响应式**: 完美适配桌面端、平板与移动端设备。

### 🛠️ 强大的实用工具
*   **工作循环设置**: 支持“大小周”、“单休”等复杂排班设置，支持手动标记“调休/补班”。
*   **实时天气**: 集成 Open-Meteo API，支持多城市天气切换、未来15天预报及历史天气回溯。
*   **纪念日提醒**: 自定义重要纪念日（生日、周年），每年自动提醒。
*   **侧边栏助手**:
    *   **待办事项 (Todo)**: 快速记录当日任务。
    *   **每日小计 (Journal)**: 记录当天的感悟与总结，支持自动保存。

## 🛠️ 技术栈

*   **前端框架**: [React 18](https://react.dev/) (TypeScript)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **样式库**: [Tailwind CSS](https://tailwindcss.com/)
*   **图标库**: [Lucide React](https://lucide.dev/)
*   **农历算法**: [lunar-javascript](https://github.com/6tail/lunar-javascript)
*   **AI 模型**: [Google Gemini API](https://ai.google.dev/) (@google/genai)
*   **天气数据**: [Open-Meteo](https://open-meteo.com/)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/zenlunar-calendar.git
cd zenlunar-calendar
```

### 2. Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KvM9vp13IOr9zX0QAeOGcEMyAVHDtWJc

### 3. Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
