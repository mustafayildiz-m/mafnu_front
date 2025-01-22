import React from 'react';
import { useIntl } from 'react-intl';
import '../../styles/LanguageSelector.css';

const I18N_CONFIG_KEY = import.meta.env.VITE_APP_I18N_CONFIG_KEY || 'i18nConfig';

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'EN', icon: '🇺🇸' },
    { code: 'fr', label: 'FR', icon: '🇫🇷' },
    // { code: 'tr', label: 'TR', icon: '🇹🇷' },
];

const LanguageSelector: React.FC = () => {
    const intl = useIntl();

    const changeLanguage = (language: string) => {
        localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({ selectedLang: language }));
        window.location.reload();
    };

    return (
        <div className="language-selector">
            {SUPPORTED_LANGUAGES.map(({ code, label, icon }) => (
                <button
                    key={code}
                    onClick={() => changeLanguage(code)}
                    className={`lang-button ${intl.locale === code ? 'active' : ''}`}
                    aria-label={`Switch to ${label}`}
                >
                    <span className="icon">{icon}</span>
                    {label}
                </button>
            ))}
        </div>
    );
};

export default LanguageSelector;
