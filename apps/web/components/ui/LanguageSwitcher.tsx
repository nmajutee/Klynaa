import React, { useState, useRef, useEffect } from 'react';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

interface LanguageSwitcherProps {
    currentLanguage?: string;
    onLanguageChange?: (language: string) => void;
    isMobile?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    currentLanguage = 'en',
    onLanguageChange,
    isMobile = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageSelect = (languageCode: string) => {
        setIsOpen(false);
        if (onLanguageChange) {
            onLanguageChange(languageCode);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent, languageCode?: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (languageCode) {
                handleLanguageSelect(languageCode);
            } else {
                setIsOpen(!isOpen);
            }
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    if (isMobile) {
        return (
            <div className="language-switcher-mobile">
                <div className="language-switcher-label">
                    <GlobeAltIcon className="w-5 h-5" />
                    <span>Language</span>
                </div>
                <div className="language-options-mobile">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageSelect(language.code)}
                            className={`language-option-mobile ${currentLanguage === language.code ? 'active' : ''
                                }`}
                            aria-label={`Switch to ${language.name}`}
                        >
                            <span className="language-flag">{language.flag}</span>
                            <span className="language-name">{language.name}</span>
                            {currentLanguage === language.code && (
                                <span className="language-checkmark">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="language-switcher" ref={dropdownRef}>
            <button
                className="language-switcher-pill"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => handleKeyDown(e)}
                aria-label="Language Switcher"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="language-flag">{currentLang.flag}</span>
                <span className="language-code">{currentLang.code.toUpperCase()}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageSelect(language.code)}
                            onKeyDown={(e) => handleKeyDown(e, language.code)}
                            className={`language-option ${currentLanguage === language.code ? 'active' : ''
                                }`}
                            role="menuitem"
                            aria-label={`Switch to ${language.name}`}
                        >
                            <span className="language-flag">{language.flag}</span>
                            <span className="language-name">{language.name}</span>
                            {currentLanguage === language.code && (
                                <span className="language-checkmark">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
