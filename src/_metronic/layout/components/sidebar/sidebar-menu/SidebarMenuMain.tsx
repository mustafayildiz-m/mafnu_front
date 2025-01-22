import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'
import {useAuth} from "../../../../../app/modules/auth";
import {useIntl} from "react-intl";

const AdminUserManagement = () => {
    const intl = useIntl();

    return (
        <SidebarMenuItemWithSub
            to='/user-management'
            title={intl.formatMessage({id: 'USER_MANAGEMENT', defaultMessage: 'Kullanıcı Yönetimi'})}
            fontIcon='bi-person-circle'
            icon='people'
        >
            <SidebarMenuItem
                to='/user-management/users'
                title={intl.formatMessage({id: 'USER_LIST', defaultMessage: 'Kullanıcı Listesi'})}
                hasBullet
            />
            {/*<SidebarMenuItem to='/user-management/settings' title={intl.formatMessage({id: 'SETTINGS', defaultMessage: 'Ayarlar'})} hasBullet/>*/}
        </SidebarMenuItemWithSub>
    );
}

const AdminMenu = () => {
    const intl = useIntl();

    return (
        <>
            <SidebarMenuItemWithSub
                to='/definitions'
                title={intl.formatMessage({id: 'DEFINITIONS', defaultMessage: 'Tanımlamalar'})}
                fontIcon='bi-gear'
                icon='element-4'
            >
                <SidebarMenuItem
                    to='/definitions/countries'
                    title={intl.formatMessage({id: 'COUNTRIES', defaultMessage: 'Ülke'})}
                    hasBullet
                />
                <SidebarMenuItem
                    to='/definitions/commission'
                    title={intl.formatMessage({id: 'COMMISSION', defaultMessage: 'Komisyon'})}
                    hasBullet
                />
                <SidebarMenuItem
                    to='/definitions/schools'
                    title={intl.formatMessage({id: 'SCHOOLS', defaultMessage: 'Okul'})}
                    hasBullet
                />
            </SidebarMenuItemWithSub>

            <AdminUserManagement/>
        </>
    );
}

const UserMenu = () => {
    const intl = useIntl();

    return (
        <>
            <SidebarMenuItemWithSub
                to='/apps/chat'
                title={intl.formatMessage({id: 'CHAT', defaultMessage: 'Chat'})}
                fontIcon='bi-chat-left'
                icon='message-text-2'
            >
                <SidebarMenuItem
                    to='/apps/chat/private-chat'
                    title={intl.formatMessage({id: 'PRIVATE_CHAT', defaultMessage: 'Private Chat'})}
                    hasBullet={true}
                />
                <SidebarMenuItem
                    to='/apps/chat/group-chat'
                    title={intl.formatMessage({id: 'GROUP_CHAT', defaultMessage: 'Group Chat'})}
                    hasBullet={true}
                />
            </SidebarMenuItemWithSub>
            <SidebarMenuItem
                to='/apps/user-management/users'
                icon='abstract-28'
                title={intl.formatMessage({id: 'USER_MANAGEMENT', defaultMessage: 'User Management'})}
                fontIcon='bi-layers'
            />
        </>
    );
}

const SidebarMenuMain = () => {
    const {currentUser} = useAuth();
    const intl = useIntl();

    return (
        <>
            <SidebarMenuItem
                to='/dashboard'
                icon='element-11'
                title={intl.formatMessage({id: 'MAIN_MENU', defaultMessage: 'Ana Menü'})}
                fontIcon='bi-app-indicator'
            />
            {currentUser?.roleID === Number(process.env.REACT_APP_ADMIN) && <AdminMenu/>}
        </>
    );
}

export {SidebarMenuMain}
