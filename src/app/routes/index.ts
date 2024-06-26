import { Router } from "express";
import userRouter from "../modules/user/user.routes";
import adminRoutes from "../modules/admin/admin.routes";
import authRoutes from "../modules/auth/auth.routes";
import doctorRoutes from "../modules/doctor/doctor.routes";
import specialtiesRoutes from "../modules/specialties/specialties.routes";
import patientRoutes from "../modules/patient/patient.routes";
import scheduleRoutes from "../modules/schedule/schedule.routes";
import appointmentRoutes from "../modules/appointment/appointment.routes";
import doctorScheduleRoutes from "../modules/doctorschedule/doctorschedule.routes";
import paymentRoutes from "../modules/payment/payment.routes";

const routes = Router();

const bulkRoutes = [
  {
    path: "/user",
    router: userRouter,
  },
  {
    path: "/admin",
    router: adminRoutes,
  },
  {
    path: "/auth",
    router: authRoutes,
  },
  {
    path: "/doctor",
    router: doctorRoutes,
  },
  {
    path: "/patient",
    router: patientRoutes,
  },
  {
    path: "/specialties",
    router: specialtiesRoutes,
  },
  {
    path: "/schedule",
    router: scheduleRoutes,
  },
  {
    path: "/doctor-schedule",
    router: doctorScheduleRoutes,
  },
  {
    path: "/appointment",
    router: appointmentRoutes,
  },
  {
    path: "/payment",
    router: paymentRoutes,
  },
];

bulkRoutes.forEach((route) => routes.use(route.path, route.router));

export default routes;
