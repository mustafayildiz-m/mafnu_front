import {useEffect} from 'react'
import {useLocation} from 'react-router'
import clsx from 'clsx'
import {useLayout} from '../../core'
import {DrawerComponent} from '../../../assets/ts/components'
import {WithChildren} from '../../../helpers'
import {useThemeMode} from "../../../partials";

const Content = ({children}: WithChildren) => {
  const {config, classes} = useLayout()
  const location = useLocation()
    let {mode}=useThemeMode();
  useEffect(() => {
    DrawerComponent.hideAll()
  }, [location])

  const appContentContainer = config.app?.content?.container
  return (
      <div
          id='kt_app_content'
          className={ clsx(
              'app-content flex-column-fluid',
              classes.content.join(' '),
              config?.app?.content?.class
          ) }
          style={{backgroundColor:mode==='light'? '#eef0f8':undefined}}
      >
          { appContentContainer ? (
              <div
                  id='kt_app_content_container'
                  style={ { width: 'auto' } }
                  className={ clsx('card card-body mx-8 px-0 py-1', classes.contentContainer.join(' '), {
                      'container-xxl': appContentContainer === 'fixed',
                      'container-fluid': appContentContainer === 'fluid',
                  }) }
              >
                  { children }
              </div>
          ) : (
              <>{ children }</>
          ) }
      </div>
  )
}

export { Content }
