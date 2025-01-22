import React, {useEffect, useState, useMemo, useRef} from 'react'
import Swal from 'sweetalert2'
import {
    fetchUsers,
    updateUserStatus,
    resetUserPassword,
    approvePayment,
    sendPaymentConfirmationEmail,
    updateUser,
    deleteUser,
    fetchRoles,
    uploadPaymentForAdmins,
    deletePayment
} from '../auth/core/_requests'

import {
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Select as ChakraSelect,
    Table,
    Tbody,
    Th,
    Thead,
    Tr,
    Td,
    Image,
    Text,
    useDisclosure,
    FormControl,
    FormLabel,
} from '@chakra-ui/react'

import { SearchIcon, HamburgerIcon, DownloadIcon, EditIcon, BellIcon } from '@chakra-ui/icons'
import {MdDelete, MdEmail, MdKey, MdCheck, MdClear, MdPersonOff, MdPersonAddAlt, MdFileUpload} from 'react-icons/md'

import { Content } from '../../../_metronic/layout/components/content'

interface SubRole {
    id: number
    subRoleName_tr: string
}
interface Role {
    id: number
    roleName_tr: string
    subRoles: SubRole[]
}

interface User {
    id: number
    name: string
    surname: string
    email: string
    paymentReceiptPath: string
    phone: string
    gender: string
    birthdate: string
    roleID: { id: number; roleName_tr: string }
    subRoleID?: { id: number; subRoleName_tr: string } | null
    language: string
    paymentApproval: boolean
    paymentReceiptRead: boolean
    isActive: boolean
    roleName_tr?: string
    subRoleName_tr?: string
    schoolID?: {
        id: number;
        schoolName: string;
    }
}

interface EditUserFormData {
    id: number
    name: string
    surname: string
    phone: string
    gender: string
    birthdate: string
    roleID: number
    subRoleID: number | null
    language: string
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [roles, setRoles] = useState<Role[]>([])
    const [rolesFetched, setRolesFetched] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [searchText, setSearchText] = useState('')

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [editUserData, setEditUserData] = useState<EditUserFormData | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const lastPageRef = useRef(1)

    const pageSize = 10

    const [showUnreadOnly, setShowUnreadOnly] = useState(false)
    const [showUnapprovedOnly, setShowUnapprovedOnly] = useState(false)
    const [showApprovedOnly, setShowApprovedOnly] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            await getRoles()
            await getUsers()
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (roles.length > 0 && !rolesFetched) {
            getUsers()
            setRolesFetched(true)
        }
    }, [roles, rolesFetched])

    const getRoles = async () => {
        try {
            const res = await fetchRoles()
            setRoles(res.data)
        } catch (err) {
            setError('Roller yüklenirken hata oluştu.')
        }
    }

    useEffect(() => {
        if (searchText) {
            setCurrentPage(1)
        } else {
            setCurrentPage(lastPageRef.current)
        }
    }, [searchText])

    useEffect(() => {
        if (!searchText) {
            lastPageRef.current = currentPage
        }
    }, [currentPage, searchText])



    const getUsers = async () => {
        try {
            const res = await fetchUsers()
            console.log(res)
            if (res) {
                const updated = res.map((u: User) => {
                    const matchedRole = roles.find((r) => r.id === u.roleID.id)
                    const matchedSub = matchedRole?.subRoles?.find((s) => s.id === u.subRoleID?.id)

                    return {
                        ...u,
                        roleName_tr: matchedRole ? matchedRole.roleName_tr : 'Bilinmiyor',
                        subRoleName_tr: matchedSub ? matchedSub.subRoleName_tr : '',
                    }
                })
                setUsers(updated)
            } else {
                setUsers([])
            }
            setLoading(false)
        } catch (err) {
            setError('Kullanıcılar yüklenirken bir hata oluştu.')
            setLoading(false)
        }
    }

    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (searchText) {
            const lower = searchText.toLowerCase();
            filtered = filtered.filter((u) => {
                const combined = `${u.name} ${u.surname} ${u.email} ${u.phone}`.toLowerCase();
                return combined.includes(lower);
            });
        }

        if (showUnreadOnly) {
            filtered = filtered.filter((u) => u.paymentReceiptPath && !u.paymentReceiptRead);
        }

        if (showUnapprovedOnly) {
            filtered = filtered.filter((u) => !u.paymentApproval);
        }

        if (showApprovedOnly) {
            filtered = filtered.filter((u) => u.paymentApproval);
        }

        return filtered;
    }, [users, searchText, showUnreadOnly, showUnapprovedOnly, showApprovedOnly])

    const totalPages = Math.ceil(filteredUsers.length / pageSize)
    const pagedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredUsers.slice(start, start + pageSize)
    }, [filteredUsers, currentPage])

    const formatDateForInput = (dateStr: string): string => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        const year = d.getFullYear()
        const month = ('0' + (d.getMonth() + 1)).slice(-2)
        const day = ('0' + d.getDate()).slice(-2)
        return `${year}-${month}-${day}`
    }

    const handleMarkPaymentReceiptAsRead = async (userId: number) => {
        try {
            await updateUser(userId, { paymentReceiptRead: true })
            Swal.fire('Başarılı!', 'Dekont görüntülendi olarak işaretlendi.', 'success')
            getUsers()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDownloadPaymentReceipt = async (row: User) => {
        try {
            const filePath = row.paymentReceiptPath
            if (!filePath) return

            const fileUrl = `${process.env.REACT_APP_API_URL}${filePath}`
            const response = await fetch(fileUrl)
            if (!response.ok) throw new Error('Dosya indirilemedi')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const fileExtension = filePath.split('.').pop()?.toLowerCase() || 'pdf'
            const fileName = `${row.name}_${row.surname}_payment-receipt.${fileExtension}`
            link.download = fileName

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            Swal.fire('Hata!', 'Dekont indirilemedi.', 'error')
        }
    }

    const handleStatusToggle = async (userId: number, isActiveStatus: boolean) => {
        try {
            const newStatus = !isActiveStatus
            await updateUserStatus(userId, newStatus)
            Swal.fire(
                'Başarılı!',
                `Kullanıcı ${newStatus ? 'aktif' : 'pasif'} hale getirildi.`,
                'success'
            )
            getUsers()
        } catch (err) {
            Swal.fire('Hata!', 'Kullanıcı durumu güncellenirken bir hata oluştu.', 'error')
        }
    }

    const handleDeleteUser = async (userId: number) => {
        try {
            const result = await Swal.fire({
                title: 'Emin misiniz?',
                text: 'Bu işlem geri alınamaz. Kullanıcı silinecek!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, sil!',
                cancelButtonText: 'Hayır, iptal et',
            })
            if (result.isConfirmed) {
                await deleteUser(userId)
                Swal.fire('Başarılı!', 'Kullanıcı başarıyla silindi.', 'success')
                getUsers()
            }
        } catch (err) {
            Swal.fire('Hata!', 'Kullanıcı silinirken bir hata oluştu.', 'error')
        }
    }

    const handleApprovePayment = async (userId: number, currentApprovalStatus: boolean) => {
        try {
            const newStatus = !currentApprovalStatus
            await approvePayment(userId, newStatus)
            getUsers()
            Swal.fire(
                'Başarılı!',
                `Kullanıcı ödemesi ${newStatus ? 'onaylandı' : 'onaydan vazgeçildi'}.`,
                'success'
            )
        } catch (err) {
            Swal.fire('Hata!', 'Ödeme durumu güncellenirken hata oluştu.', 'error')
        }
    }

    const handleResetPassword = async (userID: number) => {
        try {
            const result = await Swal.fire({
                title: 'Şifre sıfırlansın mı?',
                text: 'Bu işlem geri alınamaz.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, sıfırla!',
                cancelButtonText: 'Hayır, iptal et',
            })
            if (result.isConfirmed) {
                const response = await resetUserPassword(userID)
                if (response.message === 'Şifre başarıyla sıfırlandı.') {
                    Swal.fire('Başarılı!', 'Şifre sıfırlandı, e-posta ile gönderildi.', 'success')
                }
            }
        } catch (err) {
            Swal.fire('Hata!', 'Şifre sıfırlanırken hata oluştu.', 'error')
        }
    }

    const handleSendConfirmationEmail = async (userID: number) => {
        try {
            const result = await Swal.fire({
                title: 'Ödeme onay e-postası gönderilsin mi?',
                text: 'Bu işlem geri alınamaz.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Evet, gönder!',
                cancelButtonText: 'Hayır, iptal et',
            })
            if (result.isConfirmed) {
                await sendPaymentConfirmationEmail(userID)
                Swal.fire('Başarılı!', 'E-posta başarıyla gönderildi.', 'success')
            }
        } catch (err) {
            Swal.fire('Hata!', 'E-posta gönderilirken hata oluştu.', 'error')
        }
    }

    const handleEditClick = (user: User) => {
        setEditUserData({
            id: user.id,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            gender: user.gender,
            birthdate: formatDateForInput(user.birthdate),
            roleID: user.roleID.id,
            subRoleID: user.subRoleID?.id || null,
            language: user.language,
        })
        onOpen()
    }

    const handleUploadPayment = async (userId: number) => {
        const { value: file } = await Swal.fire({
            title: 'Dekont Yükle',
            input: 'file',
            inputAttributes: {
                accept: 'image/*,application/pdf',
                'aria-label': 'Bir dekont dosyası seçin',
            },
            showCancelButton: true,
            confirmButtonText: 'Yükle',
            cancelButtonText: 'İptal',
            preConfirm: (file) => {
                if (!file) {
                    Swal.showValidationMessage('Lütfen bir dosya seçin.');
                    return null;
                }
                return file;
            },
        });

        if (file) {
            try {
                setLoading(true);

                const response = await uploadPaymentForAdmins(file as File, userId);

                if (response?.filePath) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Dekont Yüklendi!',
                        text: 'Dekont başarıyla sisteme yüklendi.',
                    });
                    getUsers();
                } else {
                    throw new Error('Yükleme başarısız');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Yükleme Hatası!',
                    text: 'Dekont yüklenirken bir hata oluştu.',
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeletePayment = async (userId: number) => {
        const result = await Swal.fire({
            title: 'Dekont Silme Onayı',
            text: 'Bu kullanıcıya ait ödeme dekontunu silmek istediğinize emin misiniz?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Evet, sil',
            cancelButtonText: 'İptal',
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);

                const response = await deletePayment(userId);

                if (response?.message) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Dekont Silindi!',
                        text: 'Dekont başarıyla sistemden silindi.',
                    });
                    getUsers();
                } else {
                    throw new Error('Silme işlemi başarısız');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Silme Hatası!',
                    text: 'Dekont silinirken bir hata oluştu.',
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveUser = async () => {
        if (!editUserData) {
            onClose()
            return
        }
        try {
            const matchedRole = roles.find((r) => r.id === editUserData.roleID)
            const hasSubRole = matchedRole && matchedRole.subRoles.length > 0

            await updateUser(editUserData.id, {
                name: editUserData.name,
                surname: editUserData.surname,
                phone: editUserData.phone,
                gender: editUserData.gender,
                birthdate: editUserData.birthdate,
                roleID: editUserData.roleID,
                subRoleID: hasSubRole ? editUserData.subRoleID : null,
                language: editUserData.language,
            })

            Swal.fire('Başarılı!', 'Kullanıcı güncellendi.', 'success')
            getUsers()
        } catch (err) {
            Swal.fire('Hata!', 'Kullanıcı güncellenirken hata oluştu.', 'error')
        } finally {
            onClose()
        }
    }

    const handleToggleUnread = () => {
        setShowUnreadOnly(!showUnreadOnly);
        setShowUnapprovedOnly(false);
        setShowApprovedOnly(false);
        setCurrentPage(1);
    };

    const handleToggleUnapproved = () => {
        setShowUnapprovedOnly(!showUnapprovedOnly);
        setShowUnreadOnly(false);
        setShowApprovedOnly(false);
        setCurrentPage(1);
    };

    const handleToggleApproved = () => {
        setShowApprovedOnly(!showApprovedOnly);
        setShowUnreadOnly(false);
        setShowUnapprovedOnly(false);
        setCurrentPage(1);
    };

    return (
        <Content>
            <Box className='card-header px-6' display='flex' justifyContent='space-between' alignItems='center'>
                <Heading as='h2' size='md' mb={0}>
                    Kullanıcı Listesi
                </Heading>
            </Box>

            <Box className='card-body p-6'>
                {/* Arama ve filtre alanı */}
                <Flex mb={4} gap={4} align='center' justify='space-between' flexWrap="wrap">
                    <InputGroup w='300px'>
                        <InputLeftElement pointerEvents='none'>
                            <SearchIcon color='gray.300' />
                        </InputLeftElement>
                        <Input
                            placeholder='Ara...'
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            bg='white'
                        />
                    </InputGroup>

                    <Flex gap={2} flexWrap="wrap">
                        {/* Okunmamış Dekontlar Butonu */}
                        <Button
                            leftIcon={<BellIcon />}
                            colorScheme={showUnreadOnly ? 'red' : 'gray'}
                            variant='solid'
                            onClick={handleToggleUnread}
                            size='md'
                        >
                            {showUnreadOnly ? 'Tüm Dekontlar' : 'Okunmamış Dekontlar'}
                            {showUnreadOnly && (
                                <Box as='span' ml={2} bg='white' color='red.500' px={2} py={1} borderRadius='full' fontSize='xs'>
                                    {users.filter(u => u.paymentReceiptPath && !u.paymentReceiptRead).length}
                                </Box>
                            )}
                        </Button>

                        {/* Onaylanmamış Ödemeler Butonu */}
                        <Button
                            leftIcon={<MdClear />}
                            colorScheme={showUnapprovedOnly ? 'orange' : 'gray'}
                            variant='solid'
                            onClick={handleToggleUnapproved}
                            size='md'
                        >
                            {showUnapprovedOnly ? 'Tüm Ödemeler' : 'Onaylanmamış Ödemeler'}
                            {showUnapprovedOnly && (
                                <Box as='span' ml={2} bg='white' color='orange.500' px={2} py={1} borderRadius='full' fontSize='xs'>
                                    {users.filter(u => !u.paymentApproval).length}
                                </Box>
                            )}
                        </Button>

                        {/* Onaylanmış Ödemeler Butonu */}
                        <Button
                            leftIcon={<MdCheck />}
                            colorScheme={showApprovedOnly ? 'green' : 'gray'}
                            variant='solid'
                            onClick={handleToggleApproved}
                            size='md'
                        >
                            {showApprovedOnly ? 'Tüm Ödemeler' : 'Onaylanmış Ödemeler'}
                            {showApprovedOnly && (
                                <Box as='span' ml={2} bg='white' color='green.500' px={2} py={1} borderRadius='full' fontSize='xs'>
                                    {users.filter(u => u.paymentApproval).length}
                                </Box>
                            )}
                        </Button>
                    </Flex>
                </Flex>

                {loading ? (
                    <Text>Yükleniyor...</Text>
                ) : (
                    <>
                        <Box
                            overflowX='auto'
                            bg='white'
                            border='1px solid'
                            borderColor='black.200'
                            borderRadius='md'
                            p={2}
                            boxShadow='md'
                        >
                            <Table
                                variant='striped'
                                size='md'
                                colorScheme='black'
                                overflow='hidden'
                            >
                                <Thead bg='black'>
                                    <Tr>
                                        <Th color='white'>ID</Th>
                                        <Th color='white'>Ad</Th>
                                        <Th color='white'>Soyad</Th>
                                        <Th color='white'>E-posta</Th>
                                        <Th color='white'>Telefon</Th>
                                        <Th color='white'>Cinsiyet</Th>
                                        <Th color='white'>Doğum Tarihi</Th>
                                        <Th color='white'>Rol</Th>
                                        <Th color='white'>Okul</Th>
                                        <Th color='white'>Dil</Th>
                                        <Th color='white'>Ödeme Durumu</Th>
                                        <Th color='white'>Dekont</Th>
                                        <Th color='white'>Üye Durumu</Th>
                                        <Th color='white'></Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {pagedData.map((user, index) => {
                                        const filePath = user.paymentReceiptPath
                                        const isNewReceipt = !user.paymentReceiptRead
                                        const fileExtension = filePath?.split('.').pop()?.toLowerCase() || ''

                                        return (
                                            <Tr key={user.id} _hover={{ bg: 'gray.50' }}>
                                                <Td fontWeight='semibold'>{user.id}</Td>
                                                <Td>{user.name}</Td>
                                                <Td>{user.surname}</Td>
                                                <Td>{user.email}</Td>
                                                <Td>{user.phone}</Td>
                                                <Td>{user.gender}</Td>
                                                <Td>{new Date(user.birthdate).toLocaleDateString()}</Td>
                                                <Td>{user.roleName_tr || 'Bilinmiyor'}</Td>
                                                <Td>{user.schoolID?.schoolName || '-'}</Td>
                                                <Td>
                                                    {user.language === 'fr'
                                                        ? 'Fransızca'
                                                        : user.language === 'en'
                                                            ? 'İngilizce'
                                                            : 'Türkçe'}
                                                </Td>
                                                <Td color={user.paymentApproval ? 'green.600' : 'orange.500'}>
                                                    {user.paymentApproval ? 'Onaylandı' : 'Bekliyor'}
                                                </Td>
                                                <Td>
                                                    {!filePath ? (
                                                        <Text color='gray.400'>Dekont yok</Text>
                                                    ) : (
                                                        <Box>
                                                            {isNewReceipt && (
                                                                <Text
                                                                    color='white'
                                                                    bg='red.500'
                                                                    display='inline-block'
                                                                    px={1}
                                                                    fontSize='xs'
                                                                    mb={1}
                                                                    borderRadius='sm'
                                                                >
                                                                    New
                                                                </Text>
                                                            )}
                                                            <Flex align='center' gap={2}>
                                                                {['jpg', 'jpeg', 'png'].includes(fileExtension) ? (
                                                                    <Image
                                                                        src={`${process.env.REACT_APP_API_URL}${filePath}`}
                                                                        alt='Dekont'
                                                                        boxSize='40px'
                                                                        objectFit='cover'
                                                                        cursor='pointer'
                                                                        border='1px solid'
                                                                        borderColor='gray.300'
                                                                        borderRadius='sm'
                                                                        onClick={() => {
                                                                            window.open(`${process.env.REACT_APP_API_URL}${filePath}`, '_blank')
                                                                            handleMarkPaymentReceiptAsRead(user.id)
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <Button
                                                                        size='xs'
                                                                        colorScheme='blue'
                                                                        variant='outline'
                                                                        onClick={() => {
                                                                            window.open(`${process.env.REACT_APP_API_URL}${filePath}`, '_blank')
                                                                            handleMarkPaymentReceiptAsRead(user.id)
                                                                        }}
                                                                    >
                                                                        Görüntüle
                                                                    </Button>
                                                                )}
                                                                <IconButton
                                                                    aria-label='indir'
                                                                    colorScheme='green'
                                                                    size='xs'
                                                                    icon={<DownloadIcon />}
                                                                    onClick={() => handleDownloadPaymentReceipt(user)}
                                                                />
                                                            </Flex>
                                                        </Box>
                                                    )}
                                                </Td>
                                                <Td color={user.isActive ? 'green.600' : 'gray.600'}>
                                                    {user.isActive ? 'Aktif' : 'Pasif'}
                                                </Td>
                                                <Td>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            size='sm'
                                                            variant='outline'
                                                            aria-label='Actions'
                                                            icon={<HamburgerIcon />}
                                                            colorScheme='teal'
                                                        />
                                                        <MenuList>
                                                            <MenuItem icon={<EditIcon />} onClick={() => handleEditClick(user)}>
                                                                Düzenle
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<MdFileUpload />}
                                                                onClick={() => handleUploadPayment(user.id)}
                                                            >
                                                                Dekont Yükle
                                                            </MenuItem>

                                                            <MenuItem
                                                                icon={<MdDelete />}
                                                                onClick={() => handleDeletePayment(user.id)}
                                                            >
                                                                Dekont Sil
                                                            </MenuItem>


                                                            <MenuItem
                                                                icon={user.isActive ? <MdPersonOff /> : <MdPersonAddAlt />}
                                                                onClick={() => handleStatusToggle(user.id, user.isActive)}
                                                            >
                                                                {user.isActive ? 'Pasif Et' : 'Aktif Et'}
                                                            </MenuItem>
                                                            <MenuItem icon={<MdDelete />} onClick={() => handleDeleteUser(user.id)}>
                                                                Sil
                                                            </MenuItem>
                                                            <MenuItem icon={<MdKey />} onClick={() => handleResetPassword(user.id)}>
                                                                Şifre Sıfırla
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={user.paymentApproval ? <MdClear /> : <MdCheck />}
                                                                onClick={() => handleApprovePayment(user.id, user.paymentApproval)}
                                                            >
                                                                {user.paymentApproval ? 'Onaydan Vazgeç' : 'Ödemeyi Onayla'}
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<MdEmail />}
                                                                onClick={() => handleSendConfirmationEmail(user.id)}
                                                            >
                                                                Onay E-postası
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Td>
                                            </Tr>
                                        )
                                    })}
                                </Tbody>
                            </Table>
                        </Box>

                        <Flex align='center' justify='space-between' mt={4}>
                            <Button
                                size='sm'
                                colorScheme='teal'
                                variant='outline'
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                            >
                                {'<'}
                            </Button>
                            <Text>
                                Sayfa {currentPage} / {totalPages || 1}
                            </Text>
                            <Button
                                size='sm'
                                colorScheme='teal'
                                variant='outline'
                                onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                                isDisabled={currentPage === totalPages || totalPages === 0}
                            >
                                {'>'}
                            </Button>
                        </Flex>
                    </>
                )}
            </Box>

            {/* Düzenleme Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Kullanıcı Düzenle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {editUserData && (
                            <>
                                <FormControl mb={3}>
                                    <FormLabel>Ad</FormLabel>
                                    <Input
                                        value={editUserData.name}
                                        onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                                        bg='white'
                                    />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>Soyad</FormLabel>
                                    <Input
                                        value={editUserData.surname}
                                        onChange={(e) => setEditUserData({ ...editUserData, surname: e.target.value })}
                                        bg='white'
                                    />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>Telefon</FormLabel>
                                    <Input
                                        value={editUserData.phone}
                                        onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                                        bg='white'
                                    />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>Cinsiyet</FormLabel>
                                    <ChakraSelect
                                        value={editUserData.gender}
                                        onChange={(e) => setEditUserData({ ...editUserData, gender: e.target.value })}
                                        bg='white'
                                    >
                                        <option value='Erkek'>Erkek</option>
                                        <option value='Kadın'>Kadın</option>
                                        <option value='Diğer'>Diğer</option>
                                    </ChakraSelect>
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>Doğum Tarihi</FormLabel>
                                    <Input
                                        type='date'
                                        value={editUserData.birthdate}
                                        onChange={(e) =>
                                            setEditUserData({ ...editUserData, birthdate: e.target.value })
                                        }
                                        bg='white'
                                    />
                                </FormControl>
                                <FormControl mb={3}>
                                    <FormLabel>Rol</FormLabel>
                                    <ChakraSelect
                                        value={editUserData.roleID}
                                        onChange={(e) => {
                                            const newRoleID = Number(e.target.value)
                                            setEditUserData({ ...editUserData, roleID: newRoleID, subRoleID: null })
                                        }}
                                        bg='white'
                                    >
                                        <option value='' disabled hidden>
                                            Rol Seçiniz
                                        </option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.roleName_tr}
                                            </option>
                                        ))}
                                    </ChakraSelect>
                                </FormControl>
                                {(() => {
                                    const r = roles.find((role) => role.id === editUserData.roleID)
                                    if (r && r.subRoles.length > 0) {
                                        return (
                                            <FormControl mb={3}>
                                                <FormLabel>Alt Rol</FormLabel>
                                                <ChakraSelect
                                                    value={editUserData.subRoleID || ''}
                                                    onChange={(e) =>
                                                        setEditUserData({
                                                            ...editUserData,
                                                            subRoleID: Number(e.target.value) || null,
                                                        })
                                                    }
                                                    bg='white'
                                                >
                                                    <option value='' disabled hidden>
                                                        Alt Rol Seçiniz
                                                    </option>
                                                    {r.subRoles.map((sub) => (
                                                        <option key={sub.id} value={sub.id}>
                                                            {sub.subRoleName_tr}
                                                        </option>
                                                    ))}
                                                </ChakraSelect>
                                            </FormControl>
                                        )
                                    }
                                    return null
                                })()}
                                <FormControl mb={3}>
                                    <FormLabel>Dil</FormLabel>
                                    <ChakraSelect
                                        value={editUserData.language}
                                        onChange={(e) =>
                                            setEditUserData({
                                                ...editUserData,
                                                language: e.target.value,
                                            })
                                        }
                                        bg='white'
                                    >
                                        <option value='tr'>Türkçe</option>
                                        <option value='fr'>Fransızca</option>
                                        <option value='en'>İngilizce</option>
                                    </ChakraSelect>
                                </FormControl>
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleSaveUser}>
                            Kaydet
                        </Button>
                        <Button onClick={onClose}>Kapat</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Content>
    )
}

export default UserList
