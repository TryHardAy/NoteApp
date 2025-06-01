from users.models import User
from sqlalchemy.orm import Session
from sqlalchemy import select, exists, update, func
from sqlalchemy.exc import NoResultFound
from jose import jwt
from fastapi import HTTPException
from core.models import Users


def is_user_admin(user_id: str, session: Session) -> bool:
    user = get_user(user_id, session)
    return user.is_admin == 1


def login_user(user: User, session: Session) -> User:
    stmt = select(exists().where(Users.id == user.id))
    is_user = session.scalars(stmt).one()

    if not is_user:
        stmt = select(func.count()).select_from(Users)
        cnt = session.execute(stmt).scalar()
        if cnt == 0:
            user.is_admin = True
        session.add(Users(**user.model_dump()))

    return User.model_validate(get_user(user.id, session))


def get_user(user_id: str, session: Session) -> Users:
    stmt = select(Users).where(Users.id == user_id)

    try:
        user = session.scalars(stmt).one()
    except NoResultFound as e:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def update_user(user: User, session: Session) -> User:
    stmt = (
        update(Users)
        .where(Users.id == user.id)
        .values(**user.model_dump())
    )
    result = session.execute(stmt)

    return User.model_validate(result.fetchone())


def delete_user(user_id: str, session: Session) -> None:
    user = get_user(user_id, session)
    
    session.delete(user)


def get_users_except(prefix: str, user_id: str, session: Session) -> list[User]:
        
    stmt = (
        select(Users)
        .where(
            ((Users.name + " " + Users.last_name).like(f"{prefix}%") | 
            (Users.last_name + " " + Users.name).like(f"{prefix}%")) &
            (Users.id != user_id)
        )
    )

    users = session.scalars(stmt).all()

    return [User.model_validate(user) for user in users]

