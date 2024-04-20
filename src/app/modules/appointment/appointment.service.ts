import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();

const insertScheduleIntoDB = async (
  id: string,
  payload: Record<string, any>
) => {
  await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();
  const appointmentData = {
    patientId: id,
    doctorId: payload.doctorId,
    scheduleId: payload.scheduleId,
    videoCallingId,
  };

  return prisma.$transaction(async (tx) => {
    const createAppointment = await tx.appointment.create({
      data: appointmentData,
      include: {
        doctorSchedules: true,
        doctor: true,
        patient: true,
      },
    });

    await prisma.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: createAppointment.id,
      },
    });

    return createAppointment;
  });
};

export const appointmentService = {
  insertScheduleIntoDB,
};
