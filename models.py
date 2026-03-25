from exts import db
from sqlalchemy.orm import mapped_column,Mapped,relationship
from sqlalchemy import String,Integer,ForeignKey,Text,DateTime
from werkzeug.security import generate_password_hash,check_password_hash
from datetime import datetime
from typing import List

class User(db.Model):
    __tablename__ = 'user'
    id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username : Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    _password : Mapped[str] = mapped_column(String(200), nullable=False)
    avatar: Mapped[str] = mapped_column(String(500), nullable=True)

    blogs : Mapped["Blog"] = relationship("Blog", back_populates="publisher")

    def __init__(self, *args, **kwargs):
        password = kwargs.get('password')
        if password:
            kwargs.pop('password')
        super().__init__(*args, **kwargs)
        self.password = password

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, raw_password):
        self._password = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)

class BlogCategory(db.Model):
    __tablename__ = 'blog_category'
    id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name : Mapped[str] = mapped_column(String(100))

    blogs : Mapped[List["blog"]] = relationship("Blog", back_populates="category")

class Blog(db.Model):
    __tablename__ = 'blog'
    id : Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title : Mapped[str] = mapped_column(String(100))
    content : Mapped[str] = mapped_column(Text, nullable=False)
    picture : Mapped[str] = mapped_column(String(200))
    pub_date : Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    category_id : Mapped[int] = mapped_column(Integer, ForeignKey("blog_category.id"))
    category : Mapped[BlogCategory] = relationship("BlogCategory", back_populates="blogs")

    publisher_id : Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    publisher : Mapped[User] = relationship("User", back_populates="blogs")










