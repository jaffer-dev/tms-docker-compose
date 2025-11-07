import DEPARTMENTS from '../constant/Departments.constant';

const initialState = {
    createDepartmentLoading: false,

    getDepartmentsData: [],
    getDepartmentsDataLoading: false,

    managerMember: [],
    managerMemberLoading: false,

    departmentMembers: [],
    departmentMembersLoading: false,

    deleteDepartmentMembersLoading: false,

    hods: [],
    getHodsLoading: false,

    addDepartMemberLoading: false,

    hodEmployees: [],
    getHodEmployeesLoading: false
};

export default (state = initialState, action = {}) => {
    switch (action.type) {
        case DEPARTMENTS.CREATE_DEPARTMENT:
            return {
                ...state,
                createDepartmentLoading: action.loading,
            };
        case DEPARTMENTS.GET_DEPARTMENTS:
            return {
                ...state,
                getDepartmentsData: action.data,
                getDepartmentsDataLoading: action.loading
            };
        case DEPARTMENTS.DELETE_DEPARTMENT:
            return {
                ...state,
                deleteDepartmentLoading: action.loading,
            };

        case DEPARTMENTS.ADD_DEPARTMENT_MEMBER:
            return {
                ...state,
                addDepartMemberLoading: action.loading,
            };
        case DEPARTMENTS.GET_MANAGER_MEMBER:
            return {
                ...state,
                managerMember: action.data,
                managerMemberLoading: action.loading,
            };
        case DEPARTMENTS.GET_DEPARTMENT_MEMBERS:
            return {
                ...state,
                departmentMembers: action.data,
                departmentMembersLoading: action.loading,
            };
        case DEPARTMENTS.DELETE_DEPARTMENT_MEMBER:
            return {
                ...state,
                deleteDepartmentMembersLoading: action.loading,
            };
        case DEPARTMENTS.GET_HODS:
            return {
                ...state,
                hods: action.data,
                getHodsLoading: action.loading
            };
        case DEPARTMENTS.GET_HODS_EMPLOYEES:
            return {
                ...state,
                hodEmployees: action.data,
                getHodEmployeesLoading: action.loading
            };

        default:
            return state;
    }
};