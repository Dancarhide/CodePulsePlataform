import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from prisma import Prisma



from dotenv import load_dotenv

load_dotenv()

#Aqui voy a poner la seguridad mau por si la vez esto es seguridad y funciones Helpers

SECRET_KEY = os.environ.get("SECRET_KEY") or os.environ.get("JWT_SECRET")

if not SECRET_KEY:
    raise RuntimeError("CRÍTICO: No se encontró la variable SECRET_KEY en el entorno.")

import bcrypt

#Mi algoritmo Hash y el tiempo de expiración del Token
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

#Función para encriptar una contraseña Esta cosita es para el register
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

#Función para verificar si la contraseña del login coincide con la de la BD 
def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


# Genera el token que le devolvemos al usuario
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



# ---------------------------------------
# Conexion a Prisma BD esta cosita es para cuando hagamos el register y login
# ---------------------------------------

async def get_prisma():
    prisma = Prisma()
    await prisma.connect()
    try:
        yield prisma
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

# ------------------------------------------------
# Esquemas de entrada
#_------------------------------------------------

# 1. El molde para cuando alguien se registra en Code Pulse
class UserRegister(BaseModel):
    nombres: str
    apellido1: str
    apellido2: Optional[str] = None  
    nombre_usuario: str
    correo: EmailStr                 
    password: str
    avatar_url: Optional[str] = None
    avatar_style: Optional[str] = "avataaars"
    avatar_config: Optional[dict] = None

class UserLogin(BaseModel):
    correo: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    correo: EmailStr

class ResetPasswordRequest(BaseModel):
    correo: EmailStr
    new_password: str