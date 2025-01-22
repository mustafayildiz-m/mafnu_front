/* eslint-disable react-refresh/only-export-components */
import {FC, createContext, useContext} from 'react'
import {WithChildren} from '../helpers'
import {setLanguageForDatabase} from "../../app/modules/auth/core/_requests.ts";

const I18N_CONFIG_KEY = import.meta.env.VITE_APP_I18N_CONFIG_KEY || 'i18nConfig'

type Props = {
    selectedLang: 'de' | 'en' | 'es' | 'fr' | 'ja' | 'zh' | 'tr'
}
const initialState: Props = {
    selectedLang: 'en',
}

function getConfig(): Props {
    const ls = localStorage.getItem(I18N_CONFIG_KEY)
    if (ls) {
        try {
            return JSON.parse(ls) as Props
        } catch (er) {
            console.error(er)
        }
    }
    return initialState
}

// Side effect
export async function setLanguage(lang: string, userId: number) {
    localStorage.setItem(I18N_CONFIG_KEY, JSON.stringify({selectedLang: lang}));
    await setLanguageForDatabase(lang, userId);
    window.location.reload();
}


const I18nContext = createContext<Props>(initialState)

const useLang = () => {
    return useContext(I18nContext).selectedLang
}

const MetronicI18nProvider: FC<WithChildren> = ({children}) => {
    const lang = getConfig()
    return <I18nContext.Provider value={lang}>{children}</I18nContext.Provider>
}

export {MetronicI18nProvider, useLang}
