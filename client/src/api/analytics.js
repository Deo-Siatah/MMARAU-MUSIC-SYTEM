import api from "./axios";

//ministerStats
export const ministerStats = (semesterId) =>
    api.get(`/analytics/semester/${semesterId}/ministerstats`);

//total ministers
export const totalMinisters = () => 
    api.get("/analytics/ministers/total");
//rank by gender
export const rankByGender = () => 
    api.get("/analytics/ministers/rank/gender")
//no of ministers by gender
export const totalByGender = () => 
    api.get("/analytics/ministers/group/gender")

//rank all
export const rankAll = () => 
    api.get("/analytics/ministers/rankall")
//get semester
export const getSemesterCount = (semesterId) => 
    api.get(`/analytics/semestercount/${semesterId}`)