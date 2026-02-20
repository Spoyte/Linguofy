import { useLanguage } from '../i18n';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium backdrop-blur-md shadow-lg"
            title={language === 'en' ? 'Switch to French' : 'Passer en Anglais'}
        >
            <span className={`transition-all duration-300 transform ${language === 'en' ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-40 scale-95 grayscale'}`}>
                🇬🇧
            </span>
            <span className="text-white/20 font-light">/</span>
            <span className={`transition-all duration-300 transform ${language === 'fr' ? 'opacity-100 scale-110 drop-shadow-md' : 'opacity-40 scale-95 grayscale'}`}>
                🇫🇷
            </span>
        </button>
    );
}
