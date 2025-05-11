from typing import List, Optional

from sqlalchemy import Column, ForeignKeyConstraint, Index, Integer, String, Table, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Categories(Base):
    __tablename__ = 'Categories'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))

    user: Mapped[List['Users']] = relationship('Users', secondary='UserCategories', back_populates='category')
    CategoryNotes: Mapped[List['CategoryNotes']] = relationship('CategoryNotes', back_populates='category')


class Notes(Base):
    __tablename__ = 'Notes'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[Optional[str]] = mapped_column(String(50))
    content: Mapped[Optional[str]] = mapped_column(Text)

    CategoryNotes: Mapped[List['CategoryNotes']] = relationship('CategoryNotes', back_populates='note')
    UserNotes: Mapped[List['UserNotes']] = relationship('UserNotes', back_populates='note')


class Users(Base):
    __tablename__ = 'Users'

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    email: Mapped[str] = mapped_column(String(100))
    name: Mapped[Optional[str]] = mapped_column(String(50))
    last_name: Mapped[Optional[str]] = mapped_column(String(50))

    category: Mapped[List['Categories']] = relationship('Categories', secondary='UserCategories', back_populates='user')
    UserNotes: Mapped[List['UserNotes']] = relationship('UserNotes', back_populates='user')


class CategoryNotes(Base):
    __tablename__ = 'CategoryNotes'
    __table_args__ = (
        ForeignKeyConstraint(['category_id'], ['Categories.id'], ondelete='CASCADE', name='CategoryNotes_ibfk_1'),
        ForeignKeyConstraint(['note_id'], ['Notes.id'], ondelete='CASCADE', name='CategoryNotes_ibfk_2'),
        Index('note_id', 'note_id')
    )

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    note_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    permission: Mapped[int] = mapped_column(Integer)

    category: Mapped['Categories'] = relationship('Categories', back_populates='CategoryNotes')
    note: Mapped['Notes'] = relationship('Notes', back_populates='CategoryNotes')


t_UserCategories = Table(
    'UserCategories', Base.metadata,
    Column('user_id', String(50), primary_key=True, nullable=False),
    Column('category_id', Integer, primary_key=True, nullable=False),
    ForeignKeyConstraint(['category_id'], ['Categories.id'], ondelete='CASCADE', name='UserCategories_ibfk_2'),
    ForeignKeyConstraint(['user_id'], ['Users.id'], ondelete='CASCADE', name='UserCategories_ibfk_1'),
    Index('category_id', 'category_id')
)


class UserNotes(Base):
    __tablename__ = 'UserNotes'
    __table_args__ = (
        ForeignKeyConstraint(['note_id'], ['Notes.id'], ondelete='CASCADE', name='UserNotes_ibfk_2'),
        ForeignKeyConstraint(['user_id'], ['Users.id'], ondelete='CASCADE', name='UserNotes_ibfk_1'),
        Index('note_id', 'note_id')
    )

    user_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    note_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    permission: Mapped[int] = mapped_column(Integer)

    note: Mapped['Notes'] = relationship('Notes', back_populates='UserNotes')
    user: Mapped['Users'] = relationship('Users', back_populates='UserNotes')
