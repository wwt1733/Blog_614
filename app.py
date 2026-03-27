from flask import Flask, request, redirect, url_for, render_template, jsonify, session
from unicodedata import category

import config
from exts import db,migrate
from models import *
app = Flask(__name__)
app.config.from_object(config)

db.init_app(app)
migrate.init_app(app,db)
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/register',methods=['GET','POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        avatar = request.form.get('avatar')

        # 检查用户名是否已存在
        existing_user = db.session.scalar(db.select(User).where(User.username == username))
        if existing_user:
            return jsonify({"result": False, "msg": "用户名已存在"})

        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        return jsonify({"result":True,"msg":None})


@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember')

        user = db.session.scalar(db.select(User).where(User.username == username))
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['avatar'] = user.avatar

            if remember:
                session.permanent = True
            return jsonify({"result": True, "msg": None, "user": {
                "id": user.id,
                "username": user.username,
                "avatar": user.avatar
            }})
        else:
            return jsonify({"result": False, "msg": "用户名或密码错误"})

@app.route('/api/current_user')
def current_user():
    if 'user_id' in session:
        return jsonify({
            "is_logged_in": True,
            "user": {
                "id": session['user_id'],
                "username": session.get('username'),
                "avatar": session.get('avatar')
            }
        })
    else:
        return jsonify({"is_logged_in": False})



@app.route('/logout')
def logout():
    session.clear()
    return redirect('/login')

@app.route('/pub',methods=['GET','POST'])
def pub():
    if request.method == 'GET':
        if 'user_id' not in session:
            return redirect('/login')
        return render_template('pub.html')
    else:
        if 'user_id' not in session:
            return jsonify({"result": False, "msg": "请先登录"})

        title = request.form.get('title')
        content = request.form.get('content')
        picture = request.form.get('picture')
        category_name = request.form.get('category')

        if not title:
            return jsonify({"result": False, "msg": "标题不能为空"})
        if not content:
            return jsonify({"result": False, "msg": "内容不能为空"})
        if not category_name:
            return jsonify({"result": False, "msg": "分类不能为空"})

        category = db.session.scalar(
            db.select(BlogCategory).where(BlogCategory.name == category_name)
        )
        if not category:
            category = BlogCategory(name=category_name)
            db.session.add(category)
            db.session.flush() #获取category.id

        blog = Blog(
            title=title,
            content=content,
            picture=picture or '',
            category_id=category.id,
            publisher_id=session['user_id'],
        )
        db.session.add(blog)
        db.session.commit()
        return jsonify({"result":True, "msg":None, "blog_id": blog.id})


@app.route('/profile')
def profile():
    return render_template('profile.html')


if __name__ == '__main__':
    app.run()
