import { FaArrowLeftLong } from 'react-icons/fa6'
import { ConditionalRendering } from '../../utils/Methods'
import './PageHeader.css'
import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import { deleteDepartment } from "../../store/actions/Departments.action"
import { useDispatch, useSelector } from 'react-redux'
import AddMember from '../addMember/AddMember'
import AddDepartmentMember from '../addDepartmentMember/AddDepartmentMember'

const PageHeader = ({ renderBack = false, departmentId,  title, subtitle, renderTeamButton = false, teamId = "", isOpenAddModal, setIsOpenAddModal = false, renderAddMemberButton = false, isAddMember, setIsAddMember = false, onMemberAdded  }) => {

    const handleAddTeamMemberModal = () => {
        setIsOpenAddModal(true)
    }
    const handleAddMemberModal = () => {
        setIsAddMember(true)
    }

    const { userRole } = useSelector(({ auth }) => ({
        userRole: auth?.user.role,
      }));

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleDeleteTeam = () => {
        if (!teamId) return alert("Department ID is missing!");

        dispatch(deleteDepartment({ id: teamId }, () => {
            navigate(-1);
        }));
    };


    return (
        <div className={`header-wrapper-main`}>
            <div className="header-wrapper-container">
                <div className="header-wrapper-left">
                    <ConditionalRendering
                        condition={renderBack}
                        children={
                            <div className="header-wrapper-icon">
                                <button className="back-button" onClick={() => navigate('/')}>
                                    <FaArrowLeftLong />
                                </button>
                            </div>}
                    />
                    <div className="wrapper-heading">
                        <h4>{title}</h4>
                        <ConditionalRendering
                            condition={subtitle}
                            children={<h6>{subtitle}</h6>}
                        />
                    </div>
                </div>

                <div className="header-wrapper-right">
                    <ConditionalRendering
                        condition={!['EMPLOYEE', 'HOD', 'SUPERVISOR'].includes(userRole) && renderTeamButton}
                        children={<>
                            <Button type="primary" onClick={() => handleAddTeamMemberModal()} icon={<PlusOutlined />}>
                                <span className="btn-text">Add Member</span>
                            </Button>
                        </>
                        }
                    />

                    <ConditionalRendering
                        condition={renderAddMemberButton}
                        children={<>
                            <Button type="primary" onClick={() => handleAddMemberModal()} icon={<PlusOutlined />}>
                                <span className="btn-text">Add Member</span>
                            </Button>
                        </>
                        }
                    />
                </div>
            </div>
            <AddDepartmentMember
                isOpenAddModal={isOpenAddModal}
                setIsOpenAddModal={setIsOpenAddModal}
                departmentId={departmentId}
                title={title}
                onSuccess={onMemberAdded}
            />
            <AddMember
                isAddMember={isAddMember}
                setIsAddMember={setIsAddMember}
                onSuccess={onMemberAdded}
            />
        </div>
    )
}

export default PageHeader
