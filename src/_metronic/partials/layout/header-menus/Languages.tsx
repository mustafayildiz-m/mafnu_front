import clsx from 'clsx'
import React, {FC} from 'react'
import {toAbsoluteUrl} from '../../../helpers'
import {setLanguage} from '../../../i18n/Metronici18n'
import {useAuth} from "../../../../app/modules/auth";
import {FormattedMessage} from "react-intl";

// Üç dil seçeneği
const languages = [
  // {
  //   lang: 'tr',
  //   name: 'Türkçe',
  //   flag: toAbsoluteUrl('media/flags/turkey.svg'),
  // },
  {
    lang: 'en',
    name: 'English',
    flag: toAbsoluteUrl('media/flags/united-states.svg'),
  },
  {
    lang: 'fr',
    name: 'Français',
    flag: toAbsoluteUrl('media/flags/france.svg'),
  },
]

const Languages: FC = () => {
  const {currentUser} = useAuth()
  const currentLanguage = languages.find((x) => x.lang === currentUser?.language) || languages[0]
  const changeLanguage = async (lang: string) => {
    if (currentUser?.id) {
      await setLanguage(lang, currentUser.id);
    }
  };
  return (
      <div
          className='menu-item px-5'
          data-kt-menu-trigger='hover'
          data-kt-menu-placement='left-start'
          data-kt-menu-flip='bottom'
      >
        <a href='#' className='menu-link px-5'>
        <span className='menu-title position-relative'>
          <FormattedMessage id="LANGUAGE" defaultMessage="Language" />
          <span className='fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0'>
            {currentLanguage?.name}{' '}
            <img
                className='w-15px h-15px rounded-1 ms-2'
                src={currentLanguage?.flag}
                alt='flag'
            />
          </span>
        </span>
        </a>

        <div className='menu-sub menu-sub-dropdown w-175px py-4'>
          {languages.map((l) => (
              <div
                  className='menu-item px-3'
                  key={l.lang}
                  onClick={() => changeLanguage(l.lang)}
              >
                <a
                    href='#'
                    className={clsx('menu-link d-flex px-5', {active: l.lang === currentLanguage?.lang})}
                >
              <span className='symbol symbol-20px me-4'>
                <img className='rounded-1' src={l.flag} alt='flag' />
              </span>
                  {l.name}
                </a>
              </div>
          ))}
        </div>
      </div>
  )
}

export {Languages}
