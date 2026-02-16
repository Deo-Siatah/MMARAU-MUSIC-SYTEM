import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import { SemesterProvider } from "./context/semesterContext";
import {Toaster} from "sonner";
import { ServiceDraftProvider } from "./context/serviceDraftContext";
import DashboardLayout from "./layout/dashboardLayout";
import Dashboardpage from "./pages/dashboardpage";
import ManageDashboard from "./pages/ManageDashboard";
import ServiceMinister from "./components/ServiceMinisters";
import ServiceTypePicker from "./components/ServiceTypePicker";
import CreateService from "./pages/Create";
import AnalyticsDashboard from "./Analytics/AnalyticsDashboard"
export default function App() {
  return (
    <SemesterProvider>
      <ServiceDraftProvider>
    <Router>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route element={<DashboardLayout />} >
          <Route path="/" element={<Dashboardpage/>}/>
          <Route path="/service/getservice/:serviceId" element={<ServiceMinister/>}/>
          <Route path="/analyticsdashboard" element={<AnalyticsDashboard/>} />
          <Route path="/createService" element={<CreateService/>} />
          <Route path="/servicetypepicker" element={<ServiceTypePicker/>}/>
          <Route path="/managedashboard" element={<ManageDashboard/>}/>
        </Route>
      </Routes>
    </Router>
    </ServiceDraftProvider>
    </SemesterProvider>
  )
}