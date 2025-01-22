import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import {useAuth} from "../modules/auth";
import CountriesPage from "../modules/definitions/CountriesPage.tsx";
import SchoolsPage from "../modules/definitions/SchoolsPage.tsx";
import CommissionPage from "../modules/definitions/CommissionPage.tsx";
import UserList from "../modules/users/UserList.tsx";

const PrivateRoutes = () => {

    const {currentUser} = useAuth()
    return (
        <Routes>
            <Route element={<MasterLayout/>}>
                <Route path='auth/*' element={<Navigate to='/dashboard'/>}/>
                <Route path='dashboard' element={<DashboardWrapper/>}/>

                {currentUser?.roleID === Number(process.env.REACT_APP_ADMIN) && (
                    <>
                        <Route
                            path='definitions/countries'
                            element={
                                <SuspensedView>
                                    <CountriesPage/>
                                </SuspensedView>
                            }
                        />
                        <Route
                            path='definitions/schools'
                            element={
                                <SuspensedView>
                                    <SchoolsPage/>
                                </SuspensedView>
                            }
                        />
                        <Route
                            path='definitions/commission'
                            element={
                                <SuspensedView>
                                    <CommissionPage/>
                                </SuspensedView>
                            }
                        />
                        <Route
                            path='user-management/users'
                            element={
                                <SuspensedView>
                                    <UserList/>
                                </SuspensedView>
                            }
                        />
                    </>
                )}

                <Route path='*' element={<Navigate to='/error/404'/>}/>
            </Route>
        </Routes>
    )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
    const baseColor = getCSSVariableValue('--bs-primary')
    TopBarProgress.config({
        barColors: {
            '0': baseColor,
        },
        barThickness: 1,
        shadowBlur: 5,
    })
    return <Suspense fallback={<TopBarProgress/>}>{children}</Suspense>
}

export {PrivateRoutes}
