from pydantic import BaseModel


class UpsertUser(BaseModel):
    name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True


class User(UpsertUser):
    id: str


# class KeycloakUserCreate(BaseModel):
#     userId: str  # ID z tokena Keycloak
#     firstName: str
#     lastName: str
#     email: str

#     class Config:
#         orm_mode = True
#         from_attributes = True
