import { PrismaClient, UserStatus } from "@prisma/client";
import { generateToken } from "../../libs/generateToken";
import {
  BCRYPT_SALT,
  JWT_ACCESS_EXPIRE,
  JWT_REFRESH_EXPIRE,
  JWT_RESET_TOKEN_EXPIRE,
  RESET_PASS_LINK,
} from "../../config";
import { bcryptCompare, bcryptHash } from "../../utils/bcrypt";
import { extractingToken } from "../../libs/extracToken";
import { JwtPayload } from "jsonwebtoken";
import appError from "../../errors/appError";
import httpStatus from "http-status";
import emailSend from "./email.auth";

const prisma = new PrismaClient();

const loginWithDB = async (payload: { email: string; password: string }) => {
  const findUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const matchingPassword = await bcryptCompare(
    payload.password,
    findUser.password
  );

  if (!matchingPassword) {
    throw new Error("email or password not matched!");
  }

  const payloadToken = {
    email: findUser.email,
    role: findUser.role,
  };
  const accessToken = generateToken(payloadToken, JWT_ACCESS_EXPIRE as string);
  const refreshToken = generateToken(
    payloadToken,
    JWT_REFRESH_EXPIRE as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const accessTokenFromRFT = async (token: string) => {
  const verifyToken = (await extractingToken(token)) as JwtPayload;

  const findUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: verifyToken.email,
      status: UserStatus.ACTIVE,
    },
  });

  const payloadToken = {
    email: findUser.role,
    role: findUser.role,
  };

  const accessToken = await generateToken(
    payloadToken,
    JWT_ACCESS_EXPIRE as string
  );
  return {
    accessToken,
  };
};

interface IPayload {
  oldPassword: string;
  newPassword: string;
}

const userPasswordChange = async (email: string, payload: IPayload) => {
  const findUser = await prisma.user.findUniqueOrThrow({
    where: {
      email,
      status: UserStatus.ACTIVE,
    },
  });

  const matchingPassword = await bcryptCompare(
    payload.oldPassword,
    findUser.password
  );

  if (!matchingPassword) {
    throw new appError(
      "email or password not matched!",
      httpStatus.UNAUTHORIZED
    );
  }

  const hash = await bcryptHash(payload.newPassword, BCRYPT_SALT as string);
  await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hash,
    },
  });

  return {
    info: "Password changed with new password!",
  };
};

const userForgotPassword = async (payload: { email: string }) => {
  const findUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const payloadToken = {
    email: findUser.email,
    role: findUser.role,
  };
  const resetToken = generateToken(
    payloadToken,
    JWT_RESET_TOKEN_EXPIRE as string
  );

  const resetLink = RESET_PASS_LINK + `id=${findUser.id}&token=${resetToken}`;

  await emailSend(
    findUser.email,
    `
      <div>
          <p>Dear user,</p>
          <p>Your password reset link <a href=${resetLink}><button>Reset Password</button></a>
      </div>
    `
  );

  return {
    resetToken,
  };
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const findUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const hash = await bcryptHash(payload.password, BCRYPT_SALT as string);

  await prisma.user.update({
    where: {
      id: findUser.id,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hash,
    },
  });

  return {
    info: "Password updated with new password!",
  };
};

export const authService = {
  loginWithDB,
  accessTokenFromRFT,
  userPasswordChange,
  userForgotPassword,
  resetPassword,
};
