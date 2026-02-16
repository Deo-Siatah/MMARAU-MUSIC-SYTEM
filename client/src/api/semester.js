import api from "./axios"

//getsemester
export const getSemester = (semesterId) => 
    api.get(`/semester/getsemester/${semesterId}`);

//getallsemesters
export const getAllSemesters = () => api.get("/semester/getallsemesters");
//create semester
export const createSemester = (data) => 
    api.post("/semester/createsemester",data);

//update semester
export const updateSemester = (semesterId,data) => 
    api.put(`/semester/updatesemester/${semesterId}`,data);

//deactivatesemester
export const deactivateSemester = (semesterId) => 
    api.put(`/semester/deactivatesemester/${semesterId}`);
//delete semester
export const deleteSemester = (semesterId) => 
    api.delete(`/semester/deletesemester/${semesterId}`)