import api from "./axios";

//getminister
export const getMinister = (ministerId) => 
    api.get(`/minister/getminister/${ministerId}`);

//getallministers
export const getAllMinisters = () => 
    api.get("/minister/getallministers");

//createminister
export const createMinister = (data) => 
    api.post("/minister/createminister",data);
//updateminister
export const updateMinister = (ministerId,data) => 
    api.put(`/minister/updateminister/${ministerId}`,data);

//deactivateuser
export const deactivateMinister = (ministerId) =>
    api.put(`/minister/deactivateminister/${ministerId}`);

//deleteuser
export const deleteMinister = (ministerId) => 
    api.delete(`/minister/deleteminister/${ministerId}`)