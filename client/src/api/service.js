import api from "./axios"

//getservice
export const getService = (serviveId) => 
    api.get(`/service/getservice/${serviveId}`);

//getallsemesters
export const getAllServices = () => api.get("/service/getallservices");
//get availability
export const getMinistersAvailability = async (semesterId) => {
  const response = await api.get(
    `/service/ministers/availability?semesterId=${semesterId}`
  )
  return response.data
}


//create service
export const createService = (data) => 
    api.post("/service/createservice",data);

//update service
export const updateService = (serviceId,data) => 
    api.put(`/service/updateservice/${serviceId}`,data);

//delete service
export const deleteService = (serviceId) => 
    api.delete(`/service/deleteservice/${serviceId}`)

