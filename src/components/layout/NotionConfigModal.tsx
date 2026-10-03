/**
 * @file components/layout/NotionConfigModal.tsx
 * @description Notion Headless CMS 整合設定與教學彈窗
 * 提供零程式背景的網站管理者設定 Notion Integration Token 與 Database ID，
 * 並包含繁體中文 (Traditional Chinese) 步驟指南與 .env 環境變數提示。
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../i18n/translations';

export const NotionConfigModal: React.FC = () => {
  const { isNotionConfigOpen, setNotionConfigOpen, notionConfig, updateNotionConfig, language } = useAppStore();
  const t = translations[language] || translations.zh;

  const [apiKey, setApiKey] = useState(notionConfig.apiKey);
  const [craftsDbId, setCraftsDbId] = useState(notionConfig.craftsDbId);
  const [blogDbId, setBlogDbId] = useState(notionConfig.blogDbId);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotionConfig({
      apiKey: apiKey.trim(),
      craftsDbId: craftsDbId.trim(),
      blogDbId: blogDbId.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AnimatePresence>
      {isNotionConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
          {/* 背景半透明遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotionConfigOpen(false)}
            className="fixed inset-0 bg-zinc-900/70 backdrop-blur-sm"
          />

          {/* 彈窗卡片 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#89a4b8] sketch-border-thick shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* 彈窗標題與關閉按鈕 */}
            <div className="flex items-start justify-between border-b-2 border-dashed border-zinc-800 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h2 className="text-lg md:text-xl font-serif font-bold text-zinc-900">
                    {t.notionModal.title}
                  </h2>
                  <p className="text-xs text-zinc-600 font-sans">
                    {t.notionModal.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotionConfigOpen(false)}
                className="sketch-button px-3 py-1 text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>

            {/* 目前連線狀態指示徽章 */}
            <div className={`p-3 rounded-lg sketch-border mb-6 flex items-center justify-between text-xs font-serif ${
              notionConfig.isConfigured ? 'bg-emerald-100 border-emerald-800 text-emerald-900' : 'bg-zinc-800/10 text-amber-900'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${notionConfig.isConfigured ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`} />
                <span className="font-bold">
                  {notionConfig.isConfigured ? t.notionModal.statusConnected : t.notionModal.statusDemoMode}
                </span>
              </div>
              <span className="font-mono text-[11px] opacity-80">
                {notionConfig.isConfigured ? 'API Connected' : 'Fallback Local Data'}
              </span>
            </div>

            {/* 設定表單 */}
            <form onSubmit={handleSave} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-serif font-bold text-zinc-800 mb-1">
                  🔑 {t.notionModal.apiKeyLabel}
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono bg-white sketch-border focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-zinc-800 mb-1">
                    🔮 {t.notionModal.craftsDbLabel}
                  </label>
                  <input
                    type="text"
                    value={craftsDbId}
                    onChange={(e) => setCraftsDbId(e.target.value)}
                    placeholder="32-character database id"
                    className="w-full px-3 py-2 text-xs font-mono bg-white sketch-border focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-zinc-800 mb-1">
                    📚 {t.notionModal.blogDbLabel}
                  </label>
                  <input
                    type="text"
                    value={blogDbId}
                    onChange={(e) => setBlogDbId(e.target.value)}
                    placeholder="32-character database id"
                    className="w-full px-3 py-2 text-xs font-mono bg-white sketch-border focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="sketch-button px-5 py-2 text-xs font-serif font-bold bg-zinc-900 text-amber-50 hover:bg-zinc-800 shadow-md"
                >
                  ✓ {t.notionModal.saveButton}
                </button>

                {isSaved && (
                  <span className="text-xs font-serif text-emerald-700 font-bold animate-bounce">
                    ✓ 設定已儲存並重新檢索！
                  </span>
                )}
              </div>
            </form>

            {/* 繁體中文 Notion CMS 設定步驟教學 (Traditional Chinese Setup Guide) */}
            <div className="p-4 bg-zinc-800/10/60 sketch-paper-card text-xs space-y-2">
              <h4 className="font-serif font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                <span>📖</span>
                <span>{t.notionModal.setupGuideTitle}</span>
              </h4>
              <ul className="space-y-1.5 text-zinc-700 list-disc list-inside font-sans leading-relaxed">
                {t.notionModal.setupGuideSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
              <div className="pt-2 text-[11px] font-mono text-zinc-500 border-t border-zinc-300">
                💡 提示：您亦可在伺服器根目錄 .env 檔案設定 NOTION_API_KEY 與 NOTION_DATABASE_ID。
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
