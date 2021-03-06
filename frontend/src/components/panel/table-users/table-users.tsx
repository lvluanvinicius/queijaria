import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/Login/login';
import { api } from '../../../services/api';
import HeaderActionsTables from "../header-tables";
import { DataGrid, GridColDef, GridSelectionModel, GridRowParams } from '@mui/x-data-grid';
import { Dialog, } from '@mui/material';
import { useSnackbar } from 'notistack';
import { MessagesTableUsers } from "../../../hooks/messages";

import { Container, TableContent } from "./css/table-users";

/// Buttons actions
import ButtonDelete from '../buttonDelete';
import ButtonEdit from '../buttonEdit';
import ButtonResetPassword from '../buttonResetPassword';
import ButtonAddUser from '../buttonAddUser';
import WindowEditUser from '../windowEditUser';
import WindowCreateUser from '../windowCreateUser';
import WindowResetPassword from '../windowResetPassword';
import WindowDeleteUser from '../windowDeleteUser';
import { FormatTypeUser } from '../../../hooks/panel/format-typr-users';
import { FormatDateTimestamp } from '../../../hooks/panel/format-datetimestamp';

interface IConfigUsers {
    name: string;
    email: string;
    type_user: string;
    nickname: string;
    id_user: string;
    created_at?: Date;
    updated_at?: Date;
}

const TableUsers: React.FC = () => {
    const { token } = useAuth(); /// Get Token.
    const [users, setUsers] = useState<IConfigUsers[]>([]); // Para carregamento da API.
    const [userSelectedData, setUserSelectedData] = useState<IConfigUsers | undefined>(); // Para carregamento da Window Edit User...
    const [userRowSelected, setUserRowSelected] = useState<GridSelectionModel[]>([]);

    // Alert Notify.
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    /** 
     * Loading Data User
    */
    useEffect(() => {
        if (!token) {
            window.location.reload();
        } else {
            api.post("/list-all-users", "", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then((response) => {
                setUsers(response.data.users);
            }).catch((response) => {
                alert(MessagesTableUsers.errors.errorLoadingUsersData)
            });
        }
    }, [users]);
    // End Loading Data User

    /**
     * Function Format TypeUser.
     * @param params 
     * @returns 
     */
    const getTypeUserFormatForText = (params: any) => {
        return FormatTypeUser(params.value);
    }
    // End Function Format TypeUser.

    /**
     * Function Format CreatedAt and UpdatedAt.
     * @param params 
     * @returns 
     */
    const getCreatedAndUpdatedAtFormatDate = (params: any) => {
        return FormatDateTimestamp(params.value);
    }
    // End Function Format CreatedAt and UpdatedAt.


    const columns: GridColDef[] = [
        { field: "name", headerName: "Nome", width: 150, disableReorder: true },
        { field: "nickname", headerName: "Usu??rio", width: 130 },
        { field: "email", headerName: "E-mail", width: 150 },
        {
            field: "type_user", headerName: "Tipo de Usu??rio",
            valueFormatter: getTypeUserFormatForText
        },
        {
            field: "created_at", headerName: "Data de Cria????o", width: 160,
            valueFormatter: getCreatedAndUpdatedAtFormatDate
        },
        {
            field: "updated_at", headerName: "Data de Atualiza????o", width: 160,
            valueFormatter: getCreatedAndUpdatedAtFormatDate
        },
    ];

    const handleUserRowSelected = useCallback((rowState) => {
        setUserRowSelected(rowState);
    }, []);

    // Dialog User Config 
    const [openDialogUserConfig, setOpenDialogUserConfig] = React.useState(false); // State Dialog User Config...
    const handleOpenEditUser = () => {
        if (userRowSelected.length == 0) {
            enqueueSnackbar(MessagesTableUsers.errors.errorSelectedUser, { variant: "warning" });
            return false;
        } else if (userRowSelected.length != 1) {
            enqueueSnackbar(MessagesTableUsers.errors.errorSelectedOneUser, { variant: "warning" });
            return false;
        } else {
            setOpenDialogUserConfig(true);
            const userDataForWindow = users.find((dataSearch: IConfigUsers) => String(userRowSelected[0]) === dataSearch.id_user); // Select Data for Edit. 
            setUserSelectedData(userDataForWindow);
        }
    }
    const handleCloseEditUser = () => {
        setOpenDialogUserConfig(false);
    }
    // End Dialog User Config 

    // Reset Password. 
    const [passwordReset, setPasswordReset] = useState<string>(''); // State For New Password Reset
    const [resetPasswordUserDialogOpen, setResetPasswordUserDialogOpen] = useState<boolean>(false);
    const handleResetPasswordUser = () => {
        if (userRowSelected.length == 0) {
            enqueueSnackbar(MessagesTableUsers.errors.errorSelectedUser, { variant: "warning" });
            return false;
        } else if (userRowSelected.length != 1) {
            enqueueSnackbar(MessagesTableUsers.errors.errorSelectedUserForPassword, { variant: "warning" });
            return false;
        } else {
            api.post("/reset-password-user", {
                id_user_edit: userRowSelected[0]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                const { data, status } = response;

                if (status === 200) {
                    if (data.user) {
                        enqueueSnackbar(MessagesTableUsers.success.successResetedPassword, { variant: "success" });
                        setPasswordReset(data.user.password);
                        setResetPasswordUserDialogOpen(true);
                    }
                }

            }).catch(response => {
                alert(response.data.message);
            });
        }
    }

    const handleCloseResetPasswordUserDialog = () => {
        setResetPasswordUserDialogOpen(false);
    }
    // End Reset Password.


    /**
     * Cria????o de um novo usu??rio.
     */
    const [openWindowCreateUser, setOpenWindowCreateUser] = useState<boolean>(false);
    const handleCloseWindowCreateUserDialog = () => {
        setOpenWindowCreateUser(false);
    }
    // End Cria????o de um novo usu??rio.

    /** userRowSelected, setUserRowSelected
     * Dele????o de usu??rio.
     */ 
    const [openWindowDeleteUser, setOpenWindowDeleteUser] = useState<boolean>(false);
    const handleCloseWindowDeleteUserDialog = () => {        
        setOpenWindowDeleteUser(false);
    }

    const handleOpenWindowDeleteUserDialog = () => {
        const userDataForWindowDeleteUser = users.find((dataSearch: IConfigUsers) => String(userRowSelected[0]) === dataSearch.id_user); // Select Data for Edit. 
        setUserSelectedData(userDataForWindowDeleteUser);       
        setOpenWindowDeleteUser(true);
    }
    // End Dele????o de usu??rio.

    return (
        <Container>
            <TableContent style={{ height: "70vh", width: '97%', marginTop: "20px" }}>

                {/* Bot??es de a????o */}
                <HeaderActionsTables titleHeader="Usu??rios">
                    <ButtonResetPassword action={handleResetPasswordUser} />
                    <ButtonEdit action={handleOpenEditUser} />
                    <ButtonAddUser action={() => setOpenWindowCreateUser(true)} />
                    <ButtonDelete action={() => handleOpenWindowDeleteUserDialog()} />
                </HeaderActionsTables>

                {/* 
                  * Tabela de usu??rios.
                 */}
                <DataGrid
                    checkboxSelection
                    onSelectionModelChange={handleUserRowSelected}
                    // Init data
                    getRowId={(row) => row.id_user}
                    rows={users} columns={columns}
                    style={{ borderRadius: "10px", boxShadow: "0px 0px 2px rgba(0,0,0,.5)" }}
                />
            </TableContent>

            {/* 
                * Dialog: Abre uma janela de configura????o com os dados do usu??rio selecionado
                * Edi????o de Usu??rios. 
             */}
            <Dialog open={openDialogUserConfig} maxWidth="lg">
                <WindowEditUser
                    userModelObject={userSelectedData}
                    closeModel={handleCloseEditUser /* Envia o close para o compronent */}
                />
            </Dialog>

            {/* 
              * Dialog destinado ao feedback de reset de senha do usu??rio.
             */}
            <Dialog open={resetPasswordUserDialogOpen}>
                <WindowResetPassword
                    passwordReseted={passwordReset}
                    handleClose={handleCloseResetPasswordUserDialog}
                />
            </Dialog>


            {/**
             * 
             */}
            <Dialog open={openWindowCreateUser} maxWidth="lg">
                <WindowCreateUser
                    closeModel={handleCloseWindowCreateUserDialog}
                />
            </Dialog>

            {/**
             * 
             */}
            <Dialog open={openWindowDeleteUser} maxWidth="lg">
                <WindowDeleteUser
                    userDeletected={String(userRowSelected)}
                    userName={String(userSelectedData?.name)}
                    handleClose={handleCloseWindowDeleteUserDialog}                 
                />
            </Dialog>

        </Container>
    );
}


export default TableUsers;