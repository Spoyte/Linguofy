import { useLanguage } from '../i18n';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all text-sm font-medium"
            title={language === 'en' ? 'Switch to French' : 'Passer en Anglais'}
        >
            <span className={`transition-opacity ${language === 'en' ? 'opacity-100' : 'opacity-50'}`}>
                🇬🇧
            </span>
            <span className="text-slate-400">/</span>
            <span className={`transition-opacity ${language === 'fr' ? 'opacity-100' : 'opacity-50'}`}>
                🇫🇷
            </span>
        </button>
    );
}
