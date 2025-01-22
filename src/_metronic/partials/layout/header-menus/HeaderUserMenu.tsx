import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../app/modules/auth';
import { Languages } from './Languages';
import { toAbsoluteUrl } from '../../../helpers';
import Swal from 'sweetalert2';
import {FormattedMessage, useIntl} from "react-intl";

const HeaderUserMenu: FC = () => {
  const { currentUser, logout } = useAuth();

  const intl = useIntl();
  const confirmLogoutMessage = intl.formatMessage({id: "CONFIRM_LOGOUT", defaultMessage: "Are you sure you want to log out?"});
  const yesLogoutText = intl.formatMessage({id: "YES_LOGOUT", defaultMessage: "Yes, log out"});
  const noCancelText = intl.formatMessage({id: "NO_CANCEL", defaultMessage: "No, cancel"});

  const handleLogout = () => {
    Swal.fire({
      title: confirmLogoutMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: yesLogoutText,
      cancelButtonText: noCancelText,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
      <div
          className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
          data-kt-menu='true'
      >
        <div className='menu-item px-3'>
          <div className='menu-content d-flex align-items-center px-3'>
            <div className='symbol symbol-50px me-5'>
              <img alt='Logo' src={toAbsoluteUrl('media/avatars/blank.png')} />
            </div>

            <div className='d-flex flex-column'>
              <div className='fw-bolder d-flex align-items-center fs-5 text-gray-800'>
                {currentUser?.name} {currentUser?.surname}
                <span className='badge badge-light-success fw-bolder fs-8 px-2 py-1 ms-2'>{currentUser?.roleName}</span>
              </div>
              <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
                {currentUser?.email}
              </a>
            </div>
          </div>
        </div>

        <div className='separator my-2'></div>

        <Languages />

        <div className='separator my-2'></div>

        <div className='menu-item px-5'>
          <a onClick={handleLogout} className='menu-link px-5' style={{ cursor: 'pointer', color: '#d33' }}>
            <i className='fas fa-sign-out-alt me-2'></i>
            <FormattedMessage id="AUTH.LOGOUT" defaultMessage="Sign Out" />

          </a>
        </div>
      </div>
  );
};

export { HeaderUserMenu };
